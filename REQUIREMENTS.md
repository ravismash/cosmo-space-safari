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

- **Done & browser-verified:** §2 core + fun pass, 3D nav, modes, mascots, sounds.
- **To build:** §3 Fun Pack (3.1–3.3; 3.4 mostly done).
- **To ship:** README (+credits), LICENSE (MIT), .gitignore, deploy to GitHub Pages.
