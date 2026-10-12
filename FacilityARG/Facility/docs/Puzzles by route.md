# Puzzles by Route

This document enumerates interactive puzzles / minigames found in the repository, grouped by route (folder under
`app/`). For each route I list: detected puzzle genre(s), short evidence (files / symbols to verify), and a confidence
level (High / Medium / Low).

Notes:

- I inferred genres from page components, data files and TAS hints. Where something is interactive (forms, inputs,
  downloads) I treated it as a puzzle element.
- Confidence "High" means explicit puzzle logic is present in route code or supporting lib/data files. "Medium" means
  strong hints or UI but some behavior depends on external data or server. "Low" means minor/hidden or inferred from
  hints.

---

## /file-console

- Puzzle genres:
    - Terminal emulator / command-line puzzle
    - File-download puzzle (riddle PDF + hint)
    - Text-riddle embedded in files
- Evidence:
    - `app/file-console/page.tsx` — implements typed terminal, commands (`ls`, `cat`, `wget`, `sudo`, `whoami`), boot
      sequence and command handling.
    - `lib/data/fileConsole.ts` — contains `ROOT_FILES`, `CAT_FILES` (including `riddle-hint.txt`), `WGET_FILES` and
      explicit download logic for `riddle.pdf`.
- Confidence: High

## /wifi-panel

- Puzzle genres:
    - Encoding/decoding puzzle (Base64 transmit / Caesar cipher)
    - Numerical-answer riddle (sum/quiz)
- Evidence:
    - `app/wifi-panel/page.tsx` — `handleReceive` uses `btoa` to produce an encoded question; `handleCaesarSubmit`
      decodes Caesar-shift; modes: `receive`, `send`, `caesar`.
    - `lib/data/wifi.ts` — contains `messages.question`, `messages.answer` (`normal` & `ceaser`) and error messages
      guiding players to Caesar transform.
- Confidence: High

## /terminal

- Puzzle genres:
    - Keyword-collection / fill-in-the-blank puzzle (place keywords into a phrase)
    - Sequence / timed cutscene with a final-answer (email lookup / external OSINT step)
    - Download reward (VESSEL.zip)
- Evidence:
    - `app/terminal/page.tsx` — `keywords`, `keywordsMapping`, `buildPhraseDisplay()`, `step` state (`fill`, `solving`,
      `email`, `countdown`) and final `downloadVESSEL()` flow.
    - `lib/data/terminal.ts` — `keywords`, `phrase.template`, `terminalMsg.afterSuccess` (final puzzle asking for GitHub
      user email).
- Confidence: High

## /buttons

- Puzzle genres:
    - Collaborative / remote-synced button puzzle (browser detection + global presses)
    - Single-player browser-detection puzzle (press only matching browser)
- Evidence:
    - `app/buttons/page.tsx` — `getBrowserName`, server calls to `routes.api.browser.getBrowserState`, tracks
      `buttonStates`, unlocks when all pressed.
    - `lib/data/buttons.ts` (data referenced) and `HiddenFooter` unlocking `file-console` when complete.
- Confidence: High (server component outside repo required for full multiplayer behavior → Medium for cross-user
  completion)

## /black-and-white

- Puzzle genres:
    - QR-code truth/lie puzzle (two QR images with one "telling truth")
    - Hidden screen-size puzzle (form appears only at exactly 666×666)
    - 404 key-sequence easter egg (typing `404` in corner triggers branch)
- Evidence:
    - `app/black-and-white/page.tsx` — shows two QR images, reveals form only at exact size check, listens for typed
      `404` sequence and redirects to `moonlight` or `notFound`.
    - `lib/data/bnw.ts` (data referenced) contains QR/image assets and hints.
- Confidence: High

## /media

- Puzzle genres:
    - Media-decoding puzzle (audio to decode — hinted morse / morse-like audio in TAS hints and `lib/data/media` usage)
    - Download/unlock chain puzzle (two downloadable files + audio must be played; triggers unlocking `buttons` cookie
      once items interacted)
- Evidence:
    - `app/media/page.tsx` — requires keyword (`checkKeyword`) to unlock media panel; has audio playback and two
      downloadable files; unlocks `buttons` cookie after play & downloads.
    - `components/TAScript.tsx` hints mention "morse code audio" and "ZIP files are password protected with the keywords
      you've been collecting".
    - `lib/data/media.ts` referenced by page (holds `fileLoc` and hints).
- Confidence: High for download/unlock chain; Medium for exact decoding method (audio decode hinted but not explicit in
  page logic).

## /choices

- Puzzle genres:
    - Text-input pattern/easter-egg matching (regex-driven secret eggs)
    - Interactive branching leading to terminal unlock and cutscenes
- Evidence:
    - `app/choices/page.tsx` — uses `EASTER_EGG_DATA` regex matching to mark eggs, special fallback message that
      triggers monologue/cutscene, and `unlockTerminal()` that sets `cookies.terminal`.
    - `lib/data/choices.ts` (data referenced) contains egg definitions and messages.
- Confidence: High

## /home (HomeClient)

- Puzzle genres / mechanics:
    - Time-based puzzle (when system time matches a configured value it unlocks `wifiLogin`)
    - Konami-sequence keyboard easter egg (special key sequence to set `corrupt` cookie)
    - Refresh-count / RNG easter eggs (special triggers on 5/15/25 refresh counts and random 1/25 chance after 25)
    - Download/TTS puzzle (automatic download and TTS when hollow pilgrimage triggers)
- Evidence:
    - `app/home/HomeClient.tsx` — checks `text.puzzlePanel.timePuzzleVal` against current time to unlock wifi, monitors
      refresh count and handles Konami sequence; triggers downloads and TTS for hollow pilgrimage.
    - `components/TAScript.tsx` contains matching hints for the wifi/media puzzles.
- Confidence: High

## /chapters (bonus chapters)

- Puzzle genres (by act / chapter):
    - Chapter I: Server-connection credential puzzle (enter IP & port; download gift) — evidence: `lib/data/chapters.ts`
      `chIData`.
    - Chapter II: Link/image navigation & time-window puzzle (images 3 / 15 / 25, UTC time-window puzzle) — evidence:
      `chIIData`, `fileLinks.II.images`, `utcPage` timeWindow.
    - Chapter III: Clock/Discord integration puzzle (send keywords to a Discord bot, timed reveal of keywords) —
      evidence: `chapterIIIData`.
    - Chapter IV: Classic riddles (three plaque riddles — TREE, TAS, Entity) — evidence:
      `chapterIVData.chapterIVPlaques` with `riddle` strings.
    - Chapter V: Narrative/prompt-driven puzzle segments (media + tools references) — evidence: `chapterVData` entries
      and `fileLinks`.
    - Chapter VI: Endurance/time puzzle (duration-based waiting) — evidence: `chapterVIData.duration` and messages.
    - Chapter VIII: Upload/offering puzzle (upload .txt, soil/whisper mechanics and bloom words) — evidence:
      `chapterVIIIData` (upload hints, bloomWords, glyphs).
    - Chapter IX: External email submission / multi-part questionnaire (email answers; 25 participants) — evidence:
      `chapterIXData.instructions`.
- Confidence: High (these are explicit in `lib/data/chapters.ts`)

## Other notable puzzle-like areas

- `/wifi-login` — login form that is part of Wi-Fi puzzle flow (username/password checks use hashed values in
  `lib/data/wifi.ts`). Confidence: High
- `/smileking` and `/smileking-auth` — narrative areas with gating; may include puzzle gating via cookies. Confidence:
  Medium (mostly narrative gating)
- `/file-console` SUDO sequence — destructive sequence that is more of an event/jumpscare than a puzzle (mentioned here
  for completeness). Confidence: High

---

Confidence legend: High = code/data explicitly implements puzzle logic; Medium = strong hints or partial logic but some
pieces external or inferred; Low = inferred/hidden/very minor.

Next steps / suggestions

- If you want, I can:
    1. Produce a machine-readable JSON (route → genres → evidence) alongside this markdown.
    2. Add direct links (file/line snippet) into the Markdown for precise verification.
    3. Run a script to extract any other keyword-based puzzles by scanning `lib/data` for `riddle`, `question`,
       `answer`, `keyword`, `hint` tokens.

---

Generated by repository scan.

