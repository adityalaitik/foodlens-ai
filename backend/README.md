# FoodLens AI — Backend

FastAPI backend with Google Gemini Vision for food image analysis and dish nutrition lookup.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment

Copy `.env.example` to `.env` and add your Gemini API key:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_key_here
MODEL_NAME=gemini-1.5-flash
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/analyze` | Analyze food image (base64) |
| POST | `/api/ask` | Look up dish by name |

### POST `/api/analyze`

```json
{ "base64_image": "<base64 string without data URI prefix>" }
```

### POST `/api/ask`

```json
{ "dish_name": "Butter Chicken" }
```

### Response (both endpoints)

```json
{
  "dish_name": "Butter Chicken",
  "ingredients": ["chicken", "butter", "tomato", "cream", "spices"],
  "calories": { "per_serving": 450, "unit": "kcal" },
  "allergens": ["dairy"],
  "confidence": "high"
}
```

## Docs

Interactive API docs available at `http://localhost:8000/docs` after starting the server.
