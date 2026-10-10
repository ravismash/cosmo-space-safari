# Cosmo's Space Safari 🚀

A friendly, **3D solar-system explorer for kids** — tap the planets, learn fun facts, and play. Built to be **private, offline, and self-hostable**.

**Live demo:** https://ravismash.github.io/cosmo-space-safari/

## What it does

- **Explore in 3D** — real NASA planet imagery on textured globes, orbit paths, a glowing Sun, Saturn's rings, and the Milky Way. Drag to orbit, pinch/scroll to zoom, **tap a planet** to fly to it.
- **Two age modes** (behind a simple parent gate — "tap the 7"):
  - **4–6 Little Explorer** — big visuals, a fun fact, **audio narration**, and **Rexy the Space Dino**.
  - **7–9 Space Cadet** — distance / day / temperature, Q&A, and **Captain Nova**.
  - **10–12 Scientist** — "coming soon."
- **Playground of fun:**
  - **Space Weight & Jump** — see what you'd weigh on each world (real gravity), then make the mascot jump — floaty on the Moon, heavy on Jupiter.
  - **Alien & Shooting-Star Hunt** — catch the 👽 / 🌠 that zip by to fill your **Space Explorer Passport** with stickers.
  - **Build-Your-Own Rocket** — pick a nose cone and booster colors, then **Launch!**
  - **Playful synth sound effects** (no audio files — all generated in the browser).

## Privacy & safety

- **No AI, no backend, no analytics, no third-party requests.** Nothing leaves the device — preferences and the passport live only in the browser's local storage.
- Content is **curated and human-reviewed** (based on NASA facts). Sizes and distances are **stylized, not to scale**.

## Run it

It's a static site. Because it uses WebGL (3D), it must be **served over http**, not opened as a `file://`:

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Or deploy the folder to any static host (GitHub Pages, Netlify, Vercel).

### Scientist Mode (ages 10–12) — optional AI

The 4–9 app is fully static. The parent-gated **10–12 "Scientist Mode"** adds an
"Ask Cosmo" box backed by **Gemini + Google Search grounding** via one
serverless route (`api/ask-scientist.js`). Common questions are answered
instantly from a local knowledge base; only open-ended/current ones call the API.

To enable it, deploy to a host that runs serverless functions (**Vercel**):

1. Import this repo in Vercel (it auto-detects the static site + `api/` route).
2. Add an environment variable **`GEMINI_API_KEY`** (server-side) — get a key at
   https://aistudio.google.com/apikey . It is never sent to the browser.
3. Deploy. Without the key (e.g. on plain GitHub Pages), Scientist Mode still
   answers curated questions and shows a friendly fallback for the rest.

Safety: input filter + rate limit + topic blocklist + conservative Gemini
safety settings + output validation + canned fallback. No questions, answers,
or IPs are stored. These answers are **grounded**, not guaranteed — Cosmo
"searches trusted space sources and explains the answer simply."

## Project layout

```
index.html            the whole app (markup, styles, logic)
assets/               planet textures + Milky Way (JPG) and Saturn ring (PNG)
vendor/               three.js (r160) + OrbitControls
REQUIREMENTS.md       full requirements
```

## Credits

- **Planet & star imagery:** [Solar System Scope](https://www.solarsystemscope.com/textures) textures (CC BY 4.0); Pluto photo by **NASA/JHUAPL/SwRI** (New Horizons, public domain).
- **3D engine:** [three.js](https://threejs.org/) (MIT).
- Narration uses the browser's built-in Web Speech API; sound effects are synthesized with the Web Audio API.

## License

Original code and art (the app, the mascots, the UI) are released under the **MIT License** — see [LICENSE](LICENSE). Bundled third-party textures and libraries keep their own licenses, noted above.
