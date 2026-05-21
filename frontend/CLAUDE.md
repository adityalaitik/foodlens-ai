# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js on port 3000

# Build & lint
npm run build        # Production build
npm run lint         # ESLint

# Type check (no test suite exists)
npx tsc --noEmit
```

The backend (FastAPI) must also be running for API calls to work:
```bash
cd ../backend && source venv/bin/activate
uvicorn main:app --reload --reload-dir . --port 8000
```

Environment variable: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

## Architecture

### Single-page app with two top-level modes

`app/page.tsx` is the entire application. It manages two modes via Zustand (`useFoodStore`):

- **scan** — camera/voice food analysis. Has a sub-mode toggle (`ScanSubMode: 'video' | 'mic'`):
  - `video`: `CameraView` + `CaptureButton`. Manual capture only — no auto-scan.
  - `mic`: `VoiceScanMode` — speak a dish name, calls `/api/ask`, auto-reads result aloud.
- **ask** — text input → `/api/ask` → `ResultPanel` bottom sheet.

Switching top-level modes calls `clearResult()` which resets `result` and `error` in the store.

### Data flow

```
useCamera (MediaStream) → useFrameCapture (canvas → base64)
                                         ↓
                              useAnalyze.analyzeImage → POST /api/analyze
                                                                ↓
                                              useFoodStore.setResult(FoodAnalysis)
                                                                ↓
                                           LiveOverlay (scan) | ResultPanel (ask)
```

`useAnalyze` also exposes `askDish` which calls `POST /api/ask` — used by both `AskMode` and `VoiceScanMode`.

### Global state — `store/useFoodStore.ts`

Zustand store holds: `result`, `isLoading`, `error`, `mode`. All API hooks write directly to this store. Components read from it via selectors.

### API layer — `lib/apiClient.ts`

Axios instance with 30-second timeout. Sends `base64_image` as a plain base64 string **without** the `data:image/...;base64,` prefix — strip it in `lib/imageUtils.ts` before sending.

Gemini 429 / `RESOURCE_EXHAUSTED` errors are caught in `useAnalyze.ts` and logged silently (`console.warn`) — never surfaced to the UI.

### Voice — `hooks/useVoiceInput.ts` / `hooks/useVoiceOutput.ts`

Both wrap browser-native Web Speech APIs with no backend dependency. `buildSpeechText(result)` in `useVoiceOutput.ts` builds the TTS string. `useLiveAnalysis.ts` exists but is dormant (not wired into the page).

### Theming

`next-themes` with `attribute="class"`, `defaultTheme="dark"`. The `dark` class is toggled on `<html>`. Camera UI (`CameraView`, `LiveOverlay`, `CaptureButton`) is intentionally hardcoded dark — it renders over a live video feed.

For all other components, the color convention is:
- Subtle surfaces: `bg-black/5 dark:bg-white/5`
- Borders: `border-black/10 dark:border-white/10`
- Text: `text-foreground` / `text-foreground/50`
- Active/inverted: `bg-foreground text-background`

### Types — `types/index.ts`

Single source of truth: `FoodAnalysis`, `NutritionFacts`, `Allergen`, `Confidence`, `AppMode`.

### Path aliases

`@/` maps to the repo root (configured in `tsconfig.json`).

## Key constraints

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — the build passes even with type errors. Always run `npx tsc --noEmit` separately to catch type issues.
- Manual scan only — do not re-introduce auto-scan loops; they exhaust the Gemini free tier (20 req/day) in under a minute.
- shadcn/ui components live in `components/ui/` and are Radix-based. Add new ones with `npx shadcn@latest add <component>`.
