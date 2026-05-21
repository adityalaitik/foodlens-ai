# FoodLens AI — Implemented Features (MVP1)

## Backend (FastAPI)

### Core API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check — returns `{ status: ok, service: FoodLens AI Backend }` |
| `/api/analyze` | POST | Accepts `{ base64_image, upc?, store_id? }` → returns food analysis |
| `/api/ask` | POST | Accepts `{ dish_name, store_id? }` → returns food analysis |

### Catalog Lookup (Mock)
- `POST /api/analyze` with a `upc` → checks `backend/data/mock_catalog.py` first
- If UPC found in mock catalog → returns instantly, **no Gemini API call**
- If UPC not found or no UPC provided → falls back to Gemini Vision
- Mock catalog has **10 real products** keyed by UPC (milk, eggs, bread, OJ, chips, cereal, Oreos, ketchup, yogurt, peanut butter)

### `POST /api/ask` Catalog Lookup
- Fuzzy name match against mock catalog (`lower() in dish_name`)
- If match found → returns catalog entry instantly
- If no match → falls back to Gemini text analysis

### Gemini Integration
- Model: `gemini-flash-latest` via `google-genai` Python SDK
- `POST /api/analyze` → Gemini Vision (image analysis)
- `POST /api/ask` → Gemini text analysis (dish name lookup)
- `response_mime_type: application/json` forces valid JSON output
- Temperature: 0.1 for consistent results

### Rate Limit Handling
- 429 / RESOURCE_EXHAUSTED errors caught silently
- Retry delay extracted from error response and used as backoff
- No error surfaced to UI — logged to console only

### Response Schema
All endpoints return the same `FoodAnalysis` shape:
```json
{
  "dish_name": "string",
  "ingredients": ["string"],
  "nutrition": {
    "calories": 450,
    "protein_g": 25,
    "carbs_g": 40,
    "fat_g": 18,
    "fiber_g": 4,
    "sugar_g": 6,
    "sodium_mg": 620
  },
  "allergens": ["dairy", "gluten"],
  "confidence": "high | medium | low"
}
```

### Architecture
```
routers → controllers → services → ai_core
                      ↘ data/mock_catalog (catalog lookup)
```
- `ai_core/providers/gemini_provider.py` — Gemini client wrapper
- `ai_core/analyzers/food_analyzer.py` — image-based analysis
- `ai_core/analyzers/dish_analyzer.py` — text-based analysis
- `ai_core/prompts/` — food prompt, dish prompt, prompt builder
- `ai_core/parsers/gemini_parser.py` — JSON extraction + normalization
- `config/settings.py` — pydantic-settings, reads `.env`
- CORS enabled for `http://localhost:3000`

---

## Frontend (Next.js)

### Scan Mode
- **Live camera feed** — full-width video at 70vh, auto-starts on load
- **Camera fallback** — tries back camera first (mobile), falls back to any camera (MacBook/desktop)
- **Manual capture button** — circular white button, triggers single frame analysis
- **Flash animation** on capture
- **LIVE badge** with pulsing red dot on camera feed

### Live Overlay (on video)
Displayed directly on the camera feed — no separate panel:
- **Dish name** — large bold text
- **Confidence badge** — color coded: green (high) / yellow (medium) / red (low)
- **Quick nutrition chips** — `🔥 calories kcal · 💪 Xg protein · 🌾 Xg carbs · 🧈 Xg fat`
- **Allergen emojis** — only present allergens shown: 🥛 🥜 🌾 🫘 🥚
- **Analyzing...** indicator — pulsing green dot while API call is in flight

### Ask Mode
- Text input for dish name search
- Recent searches stored in `localStorage` (max 5), shown as quick-tap buttons
- Results shown in **ResultPanel** bottom sheet (slides up with spring animation)

### ResultPanel (Ask Mode)
Full bottom sheet with 3 tabs:
- **Ingredients tab** — staggered animated list with green dot bullets
- **Nutrition tab** — 7-nutrient breakdown with colored progress bars + % Daily Value
  - Calories 🟠, Protein 🔵, Carbs 🟣, Fat 🟡, Fiber 🟢, Sugar 🩷, Sodium 🩵
- **Allergens tab** — all 5 allergens shown with present/absent status (red alert / green check)

### Nutrition Facts Display
- Per-serving values for: calories, protein, carbs, fat, fiber, sugar, sodium
- Animated progress bars with individual colors
- % Daily Value calculated against standard 2000 kcal diet
- Staggered entry animation (Framer Motion)

### State Management (Zustand)
Global store: `result`, `isLoading`, `error`, `mode`
- `mode`: `scan | ask`
- Switching tabs clears previous result
- Error state handled silently for rate limit errors

### API Client
- Axios instance with `baseURL: http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- 30-second timeout
- Sends `base64_image` without data URI prefix

---

## Infrastructure

### Environment
- Backend `.env`: `GEMINI_API_KEY`, `MODEL_NAME=gemini-flash-latest`
- Frontend: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
- Gemini API key also set in `~/.zshrc` as system env var

### Local Dev
```bash
# Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload --reload-dir . --port 8000

# Frontend
cd frontend && npm run dev
```

### Backend Dependencies
`fastapi`, `uvicorn`, `google-genai`, `pydantic`, `pydantic-settings`, `python-dotenv`

### Frontend Dependencies
Next.js 15, React 19, TypeScript, Tailwind CSS 4, Zustand, Framer Motion, Axios, shadcn/ui, Lucide React

---

## Known Constraints
- **Gemini free tier**: 20 requests/day — rate limit handled silently, no UI error shown
- **Manual scan only**: auto-scan disabled to avoid exhausting free-tier quota
- **Mock catalog**: 10 hardcoded products — real MongoDB integration is MVP2
