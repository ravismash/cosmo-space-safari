// Scientist Mode (ages 10–12) — serverless route for Vercel.
//
// The LLM is never the authority on what a child sees: this route wraps a
// Gemini + Google Search grounding call in a deterministic policy layer —
// input checks → blocklist → model → output validation → source chips →
// fallback. Curated/common questions are answered client-side without ever
// reaching here (see LOCAL_KB in index.html).
//
// Security: GEMINI_API_KEY is a SERVER-SIDE env var only. Nothing is stored —
// no questions, answers, or IPs are persisted; the rate limiter is in-memory
// and ephemeral. Set GEMINI_API_KEY in the Vercel project's Environment
// Variables; without it the route returns a friendly fallback.

const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are Cosmo, a friendly space science guide for an 11-year-old.
Rules:
- Use Google Search grounding when the question needs facts.
- Answer in at most 3 short sentences.
- Use simple, exciting language suitable for ages 10–12.
- Be scientifically accurate. If evidence is uncertain, say: "Scientists are still studying this."
- Never invent numbers, missions, dates, or sources.
- Never ask for the child's name, location, school, photo, or personal details.
- Do not discuss violence, scary events, self-harm, drugs, sex, or medical advice.
- If the question is unsafe or unrelated to space/science, reply: "I'm best at space questions! Try asking me about planets, moons, rockets, or stars."
- Do not include links, phone numbers, emails, code, or instructions.
- End with one fun follow-up question only if it fits naturally.`;

// Topics that must never be answered — redirect instead.
const BLOCKLIST = [
  /\b(address|phone number|where do you live|your name|my name|my address|my school|my photo|where i live)\b/i,
  /\b(kill|gun|weapon|war|blood|die|death|suicide|self[-\s]?harm|hurt myself)\b/i,
  /\b(sex|sexual|porn|nude|drugs?|alcohol|cigarette|vape)\b/i,
  /\b(medicine|medical|diagnos|symptom|disease|pill|dosage)\b/i,
];

const REDIRECT = "I'm best at space questions! Try asking me about planets, moons, rockets, or stars. 🚀";
const FALLBACK = "Hmm, my space radio is a little fuzzy right now! 📡 Try asking again, or ask me about planets, moons, rockets, or stars.";

// Best-effort in-memory daily rate limit (per instance; ephemeral — no storage).
const rate = new Map();
const DAILY_CAP = 60;
function rateLimited(ip) {
  const now = Date.now(), day = 86_400_000;
  let r = rate.get(ip);
  if (!r || now > r.resetAt) { r = { count: 0, resetAt: now + day }; rate.set(ip, r); }
  r.count += 1;
  return r.count > DAILY_CAP;
}

const DOMAIN_LABEL = {
  "nasa.gov": "NASA", "science.nasa.gov": "NASA", "jpl.nasa.gov": "NASA JPL",
  "en.wikipedia.org": "Wikipedia", "wikipedia.org": "Wikipedia",
  "space.com": "Space.com", "esa.int": "ESA", "nationalgeographic.com": "Nat Geo",
};
function sourceChips(meta) {
  const chunks = (meta && meta.groundingChunks) || [];
  const out = [], seen = new Set();
  for (const c of chunks) {
    const uri = (c.web && c.web.uri) || "";
    let host = ""; try { host = new URL(uri).hostname.replace(/^www\./, ""); } catch {}
    const label = DOMAIN_LABEL[host] || (c.web && c.web.title ? c.web.title.split(/[-|–•]/)[0].trim().slice(0, 24) : host);
    if (label && !seen.has(label)) { seen.add(label); out.push(label); }
    if (out.length >= 2) break;
  }
  return out;
}

// Reject/strip anything a child shouldn't see in the output.
function validateOut(text) {
  if (!text) return null;
  let t = String(text).trim();
  t = t.replace(/```[\s\S]*?```/g, "").replace(/https?:\/\/\S+/g, "").replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "");
  t = t.replace(/\b\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, "").replace(/\s{2,}/g, " ").trim();
  // Enforce brevity deterministically: keep at most 3 sentences (the model
  // doesn't always obey the prompt).
  const sentences = t.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (sentences && sentences.length > 3) t = sentences.slice(0, 3).join("").trim();
  if (t.length > 380) t = t.slice(0, 377).trim() + "…";
  return t || null;
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(200).json({ answer: FALLBACK, sources: [], ok: false, reason: "not_configured" }); return; }

  let body = {};
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}); } catch {}
  const question = (body.question || "").toString().trim();

  // 1. Input checks.
  if (question.length < 2) { res.status(400).json({ error: "empty" }); return; }
  if (question.length > 200 || !/^[\p{L}\p{N}\s?!.,'"()\-:;+/&%’]+$/u.test(question)) {
    res.status(200).json({ answer: REDIRECT, sources: [], ok: true }); return;
  }
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (rateLimited(ip)) {
    res.status(200).json({ answer: "Phew! That's a lot of questions today — let's take a little space break and come back tomorrow! 🌙", sources: [], ok: true, reason: "rate_limited" });
    return;
  }

  // 2. Blocklist.
  if (BLOCKLIST.some((re) => re.test(question))) {
    res.status(200).json({ answer: REDIRECT, sources: [], ok: true }); return;
  }

  // 3. Gemini + Search grounding, with conservative safety settings.
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        tools: [{ google_search: {} }],
        // Disable "thinking" so the token budget goes to the short answer, not
        // internal reasoning (gemini-2.5-flash thinks by default).
        generationConfig: { temperature: 0.4, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
        safetySettings: [
          "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
          "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT",
        ].map((category) => ({ category, threshold: "BLOCK_LOW_AND_ABOVE" })),
      }),
    });
    if (!r.ok) { res.status(200).json({ answer: FALLBACK, sources: [], ok: false }); return; }
    const data = await r.json();
    const cand = data.candidates && data.candidates[0];

    // 4. Output validation (defense in depth — never trust the model alone).
    const raw = cand && cand.content && cand.content.parts ? cand.content.parts.map((p) => p.text).filter(Boolean).join(" ") : "";
    const answer = validateOut(raw);
    if (!answer || (cand && cand.finishReason === "SAFETY")) {
      res.status(200).json({ answer: FALLBACK, sources: [], ok: true }); return;
    }

    // 5. Source chips from grounding metadata (labels, not raw links).
    res.status(200).json({ answer, sources: sourceChips(cand.groundingMetadata), ok: true });
  } catch {
    res.status(200).json({ answer: FALLBACK, sources: [], ok: false });
  }
}
