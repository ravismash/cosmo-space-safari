# Cosmo's Space Safari — Requirements

A kids' 3D solar-system explorer. Private, offline, self-hostable, zero runtime dependencies at the service level (three.js is vendored locally). Ages 4–9 in v1; 10–12 stubbed.

## 1. Audience & modes

- **4–6 "Little Explorer":** big visuals, one fun fact, audio narration, no numbers, **Rexy the Dino** mascot.
- **7–9 "Space Cadet":** metrics (distance / day length / temperature) + Q&A, **Captain Nova** mascot.
- **10–12 "Scientist":** locked "coming soon" (future: a safely-guarded AI answer mode).
- Mode switching is behind a **parent gate** ("tap the number seven"); auto-relocks.

## 2. Core experience (BUILT & verified)

- **3D scene:** 11 bodies (Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) as real-texture globes on orbit paths; self-spin + slow revolution; Sun glow, Saturn rings, Milky Way backdrop.
- **Navigation:** drag to orbit, pinch/scroll to zoom, **tap a planet → camera flies in + facts panel opens**; Home/reset; ± zoom buttons; accessible **Worlds list** fallback.
- **Facts panel:** mascot guide, summary (age-appropriate), fun fact (4–6) or metrics (7–9), "Read it to me" (Web Speech TTS), Quick-Question pills with pre-written answers.
- **Fun pass (built):** animated mascot (bob/blink/wave/cheer), speech bubble, sparkle burst, synthesized SFX (dino "rawr" / radio "blip" / ding / whoosh), 🔊 mute.
- **Boot self-check:** validates content; shows a banner instead of broken content.

## 3. v1.1 Fun Pack (PLANNED — to add)

### 3.1 Space Weight & Jump
- Per-planet **weight comparison** using real surface gravity (e.g. 50 lb on Earth → 19 lb on Mars → 126 lb on Jupiter). No typed input (4–6): a tap stepper or preset "you / a puppy / a backpack" picks the Earth weight.
- **Jump Test** button: Rexy jumps — height scaled by 1/gravity, so he barely hops on Jupiter and floats to the top in slow-motion on the Moon with a "wheee!" synth sound.
- Data: add `gravity` (g, Earth = 1) to each body. Reference values — Mercury 0.38, Venus 0.91, Earth 1.00, Moon 0.166, Mars 0.38, Jupiter 2.53, Saturn 1.07, Uranus 0.89, Neptune 1.14, Pluto 0.063, Sun ≈28 (playful: "too hot to visit!").

### 3.2 Secret Alien & Shooting-Star Hunt (easter egg)
- Every ~20–40 s a tiny 👽 or 🌠 zips across the canvas.
- Tap it quickly → joyful "ding", golden sparkle shower, and a **sticker added to a "Space Explorer Passport"** (a collectible grid, persisted per-device in localStorage). Turns passive viewing into hide-and-seek.

### 3.3 Build-Your-Own Wacky Rocket (pre-flight minigame)
- On first load / from a "Build Rocket" button: pick a **nose cone** (dino head, banana, classic tip), **booster colors** (neon pink, starry blue, rocket fire).
- "**Launch!**" animates the custom rocket across the screen to start the journey. Choice remembered per-device.

### 3.4 Zero-dependency synth sounds (mostly built)
- All SFX via Web Audio (no audio files): planet-tap "pop", **victory chime** when a secret/sticker is unlocked, Rexy "rawr", whoosh on fly-to, ding. Respect the 🔊 mute.

## 4. Non-functional / constraints

- **No runtime AI/LLM, no backend, no analytics, no third-party requests.** Nothing leaves the device (only local prefs/passport in localStorage). COPPA/privacy-safe.
- **Offline** after first load. WebGL requires the page be **served** (GitHub Pages / any static host), not opened as a `file://`.
- **Accessibility:** ARIA + keyboard on UI, Worlds-list fallback for planet selection, `prefers-reduced-motion` honored, ≥48px touch targets, mute.
- Content is **curated & human-reviewed** (NASA-based). Sizes/distances are **stylized, not to scale** (stated in-app).
- iPad-optimized touch; works on phone and desktop.

## 5. Tech & assets

- Single `index.html` + `assets/` (12 textures, ~1.2 MB) + `vendor/` (three.js r160, OrbitControls).
- No build step.

## 6. Credits (must appear in README)

- NASA — planet imagery (public domain, incl. New Horizons Pluto).
- Solar System Scope — planet/ring textures (CC-BY 4.0).
- three.js — MIT.

## 7. Status

- **Done, browser-verified & deployed (v1.0):** §2 core + §3 Fun Pack (3.1–3.4) + visual upgrades (nebula, stardust, planet halos, glassmorphism, confetti). Live at https://ravismash.github.io/cosmo-space-safari/ ; shipped with README (credits), MIT LICENSE, .gitignore.
- **Planned (v1.1):** §8 Scientist Mode (10–12) — a separate, parent-enabled AI experience. Not built yet; see below.

## 8. Scientist Mode — ages 10–12 (v1.1, AI, SEPARATE BUILD)

A clearly-labeled, **parent-enabled** older-kids mode that answers free-text space questions. This is the **only** place AI enters the product, and it requires a backend — it does **not** run on the static GitHub Pages app. Ship it as a distinct v1.1 experience.

### 8.1 Split architecture (approved)
- **Ages 4–9:** the existing static client-side app — local content, animations, TTS, **no backend**. Unchanged.
- **Ages 10–12:** **one serverless route** (`/api/ask-scientist`, e.g. Vercel function) calling **Gemini with Google Search grounding**. No multi-agent orchestration, no MCP server (they add latency, cost, and failure modes without improving the child's experience).

### 8.2 Two-tier answer strategy (curated first, grounded AI second)
1. **Curated first:** for the ~10 core Solar System objects and stable facts (size, moons, gravity, orbits, temperatures), answer instantly from the local JSON knowledge base — no API call.
2. **Grounded AI second:** call Gemini only when the question is not covered, is comparative/imaginative ("What if Earth had two moons?"), or needs current information. Reduces latency, cost, and hallucination exposure.

### 8.3 Request flow (`/api/ask-scientist`)
Client sends `{ question, ageMode }` →
1. **Input checks:** length cap, allowed characters, **rate limit** (per IP/session + daily cap).
2. **Blocklist:** personal data, violence, scary content, medical advice, and other non-space/unsafe topics.
3. **Gemini call** with the `google_search` tool enabled + the system prompt (§8.4) + conservative safety settings.
4. **Output validation:** length cap; reject/strip URLs, phone numbers, emails, code, personal-data requests.
5. **Source chips:** if grounding metadata exists, attach 1–2 **kid-friendly source labels** (not raw links).
6. Return normalized JSON → client renders the Cosmo bubble + optional "Where did this come from?" chips.

### 8.4 System prompt (strict)
> You are Cosmo, a friendly space science guide for an 11-year-old.
> Rules:
> - Use Google Search grounding when the question needs facts.
> - Answer in at most 3 short sentences.
> - Use simple, exciting language suitable for ages 10–12.
> - Be scientifically accurate. If evidence is uncertain, say: "Scientists are still studying this."
> - Never invent numbers, missions, dates, or sources.
> - Never ask for the child's name, location, school, photo, or personal details.
> - Do not discuss violence, scary events, self-harm, drugs, sex, or medical advice.
> - If the question is unsafe or unrelated to space/science, reply: "I'm best at space questions! Try asking me about planets, moons, rockets, or stars."
> - Do not include links, phone numbers, emails, code, or instructions.
> - End with one fun follow-up question only if it fits naturally.

### 8.5 Guardrails (the minimum viable safety architecture)
| Risk | Mitigation |
|---|---|
| API key leakage | `GEMINI_API_KEY` is a **server-side env var only**; never imported into client code |
| Unlimited API cost | Rate-limit by IP/session, cap question length, require a tap before each request, daily usage cap |
| Hallucinated science | Require Search grounding for factual questions; show source chips; fallback answer when grounding is weak |
| Inappropriate output | Input filter **+** Gemini safety settings **+** output validator **+** canned fallback (defense in depth — don't rely on model safety alone) |
| Child data collection | Do **not** store questions, answers, IPs, or identifiers; ephemeral rate limiting only |
| Scary answers | Topic blocklist; redirect to planets, rockets, stars, moons |

### 8.6 Positioning / copy (honest, no overpromising)
- Call it **"grounded answers,"** not "real-time/perfectly-accurate facts." Grounding improves factuality and gives sources; it is **not** an oracle.
- Child-facing promise: *"Cosmo searches trusted space sources and explains the answer simply."*
- Don't make James Webb / live updates a core dependency — most Solar System facts are stable and served from the curated layer.

### 8.7 Delivery notes
- Needs a host that runs serverless functions (Vercel/Netlify Functions) — the 4–9 app can stay on static hosting; the 10–12 mode is a separate deploy with the API route.
- Requires the owner's **own Gemini API key** (provided via the host's secret manager, never in the repo or chat).
- COPPA/DPDP: a 10–12 free-text AI feature raises the compliance bar vs. the fully-static 4–9 app — keep it parent-gated, store nothing, and review before public launch.

> Design note: this is the "LLM proposes, deterministic layer decides" pattern — the input filter, grounding requirement, output validator, and fallback are a **policy layer wrapped around the model**, exactly so the model is never the final authority on what a child sees.
