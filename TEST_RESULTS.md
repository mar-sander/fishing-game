# Stage RESULT-1 FA3 — WIN Fanfare Volume 80% (No.M request)

- Date: 2026-10-30. `GITHUB_WRITE_MODE: NO_WRITE`; **Package Ready / No.M review required**.
- Base candidate: RESULT-1 FA2 (WIN MP3). Public `main` as checked before this change: `1caed61b9f9d2d3ffb14f7554dc6bd4f882cc7c3`. RESULT-1 stages are not yet released.
- Requested adjustment only: `audio.js` victory media volume changes from `.70` to `.56` (`.70 × .80`). This is an HTMLAudioElement volume multiplier, not a measured 20% change in perceived loudness.
- No other game/audio behavior changed: battle BGM `.25`, judgment SE, DRAW / DOUBLE K.O. PCM fanfares, gameplay rules, visuals and victory MP3 playback timing are preserved.
- `fanfare.mp3` is already on the GitHub Pages repository root. Standalone preview loads it from `https://mar-sander.github.io/fishing-game/fanfare.mp3`; product `index.html` loads it by relative path. The MP3 file is not repackaged or edited.
- Changed production file: `audio.js`. Updated verification: `tests/audio.test.cjs`; regenerated `FISHING_DUEL_FA2_Preview.html`, `SOURCE_HASHES.json`, `PACKAGE_MANIFEST.json`, testing evidence and this handoff.
- **Not published.** No branch/push/PR/merge/Pages writes. No.M must approve the modified version and expressly authorize publishing. Before release, reconcile source and test changes against the latest `main` (BGM-2 only, not RESULT-1).
- Actual speaker loudness, user-hosted MP3 data and real-device playback are not validated by these source tests.

## Stage RESULT-1 FA3 minimal manual check

1. SOUND ON, play to HUMAN WIN/FISH WIN: same fanfare plays at about 80% of FA2's media gain; battle BGM remains off during results.
2. Replaying, turning SOUND OFF and returning to the title still stop the fanfare. DRAW and DOUBLE K.O. stay identical.

---

# Stage RESULT-1 FA2 — Final Regression (WIN MP3)

- Date: 2026-10-30
- Baseline for public GitHub main: `1caed61b9f9d2d3ffb14f7554dc6bd4f882cc7c3` (GitHub read-only)
- Target candidate: Grand RESULT-1 with only WIN audio output changed to uploaded `fanfare.mp3`
- Node.js v22.16.0 on Linux; `node --test tests/*.test.cjs`: **129 PASS / 0 FAIL / 0 SKIP**.
- Newly validated: WIN does not use old 8s synthetic WebAudio; WIN MP3 only on RESULT; not on title/countdown/playing/paused/finishing; DRAW/DKO retain distinct 8s PCM; SOUND OFF/title/rematch resets; `file://`/standalone preview chooses external URL; web production uses relative file.
- Browser: Chromium headless via Playwright `page.set_content()` with substitute MP3 data URI to test real HTMLAudioElement behavior. Started after RESULT, paused before and after title, `loop=false`, WebAudio voices=0, battle BGM paused, JS errors=0.
- **Not verified:** The actual contents, loudness, duration and licensing of the user-hosted `fanfare.mp3`; real speaker/keyboard gameplay. File existence, size and Git blob ID were verified through GitHub listing.
- The old GRAND/WIN PCM waveform still exists as an inert exported compatibility function, but the WIN result flow does not generate/play that buffer.

---

# RESULT-1 Final Adjustment 1 — Regression Test Results

- Date: 2026-10-28
- Source baseline (public main): `44f08082d52db339598765aa0d8205f7d1f6d9d0`
- Environment: Linux, Node.js v22.16.0, `node --test tests/*.test.cjs`
- **127 PASS / 0 FAIL / 0 SKIP**（RESULT-1の126件＋FA1の新規1件）
- FA1 additional test: ~8 sec and MAX .59, Human/Fish equal WIN audio, grand-finale 6–7 sec energy, finite PCM, fade ending.
- DRAW / DOUBLE K.O. PCM hashes each byte-identical to RESULT-1 initial candidate.
- Protected `app.js`, engine, scene, style, template, index.html, build tool all byte-identical to RESULT-1.
- Chromium (headless, in-memory set_content) loaded self-contained preview without JavaScript exceptions. `file://` direct browser access blocked by environment security; actual physical speaker and gameplay result sound remains unverified.
- HTML preview/source and ZIP internal SHA-256 package integrity verified externally; see `PACKAGE_MANIFEST.json` and companion SHA-256 record.
- Result-1 FA1 is unpublished; `GITHUB_WRITE_MODE: NO_WRITE`; No.M real device acceptance pending.
