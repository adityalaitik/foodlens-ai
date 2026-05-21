# FoodLens AI — MVP4: Feature Expansion Roadmap

## Overview
Beyond MVP1 (scan + Gemini), MVP2 (MongoDB + Qdrant + RAG), and MVP3 (shop ingredients),
this document captures all additional features grouped by impact area with priority guidance.

---

## Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│  HIGH VALUE / LOW EFFORT                                │
│  → Barcode Scanner, Portion Size Adjuster               │
│                                                         │
│  HIGH VALUE / MEDIUM EFFORT                             │
│  → Daily Nutrition Tracker, Dietary Profile             │
│  → Healthier Swap Suggestion, Multi-dish Detection      │
│                                                         │
│  HIGH VALUE / HIGH EFFORT (Differentiators)             │
│  → Retail-Aware Meal Planning                           │
│  → Restaurant Menu Scanner                              │
│  → Apple Health / Google Fit Integration                │
│                                                         │
│  FUTURE / BRAND POSITIONING                             │
│  → Carbon Footprint, Voice Mode, Browser Extension      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Product Depth

### 1. Barcode Scanner
**What:** Point camera at any product barcode → auto-extract UPC → instant catalog lookup. Zero Gemini API call for any product already in the catalog.

**How:**
- Add `zxing-js` barcode scanner library to frontend
- Runs on the live camera feed (no extra tap needed)
- On UPC detected → `POST /api/analyze` with `{ upc, store_id }` (no image needed)
- Falls back to Gemini Vision only if UPC not found in catalog

**Impact:** Eliminates API cost for every labeled catalog product. Fastest possible result (no Gemini latency).

---

### 2. Portion Size Adjuster
**What:** Slider on the result overlay — `½ × | 1 × | 2 ×` — all nutrition values scale instantly. No API call needed.

**How:**
- Add a multiplier slider to `LiveOverlay.tsx`
- All nutrition values multiplied client-side in real time
- State: `portionMultiplier: 0.5 | 1 | 1.5 | 2`

**Impact:** Simple math, huge UX value for users tracking intake.

---

### 3. Multi-dish Detection
**What:** A plate often has rice + curry + salad. Detect each item separately and sum total nutrition.

**How:**
- Update Gemini prompt to return an array of dishes if multiple are detected
- New response shape: `{ dishes: [FoodAnalysis], total_nutrition: NutritionFacts }`
- Overlay shows each dish as a tab, plus a "Total" tab

**Impact:** More accurate for real-world plates. Differentiates from single-item scanners.

---

### 4. Expiry Date Detection
**What:** Point camera at product packaging → Gemini reads "Best By" / "Use By" date → app warns before expiry.

**How:**
- New Gemini prompt focused on OCR + date extraction
- New endpoint: `POST /api/expiry` → `{ base64_image }` → `{ expiry_date, days_remaining, status }`
- Status: `fresh | expiring_soon | expired`
- Frontend: expiry badge on overlay

**Impact:** Useful for retail shelf management and home pantry tracking.

---

## 📊 Health & Tracking

### 5. Daily Nutrition Tracker
**What:** Aggregate all scans in a day → show progress toward daily nutrition targets.

**How:**
- Store each scan result in `localStorage` with timestamp
- New `TrackerPanel` component: progress bars for calories, protein, carbs, fat vs daily goals
- Default goals: 2000 kcal, 50g protein, 275g carbs, 78g fat
- Date navigation: view any past day

**Data shape:**
```typescript
interface ScanLog {
  id: string
  timestamp: string
  result: FoodAnalysis
  portionMultiplier: number
}
```

**Impact:** Core retention feature. Turns one-time users into daily users.

---

### 6. Dietary Profile
**What:** User sets their dietary restrictions → results auto-highlight conflicts.

**Profiles:**
- Vegan / Vegetarian
- Gluten-Free
- Diabetic-Friendly (flag high sugar)
- Keto (flag high carbs)
- Nut Allergy / Dairy-Free

**How:**
- Settings screen: toggle switches for each profile
- Stored in `localStorage`
- On scan result: allergens + nutrition values flagged in red if they conflict with user profile
- No AI needed — pure client-side logic against existing `allergens` + `nutrition` fields

**Impact:** High safety value. Differentiates for health-conscious users.

---

### 7. Apple Health / Google Fit Integration
**What:** Write nutrition data from each scan directly into the health platform with one tap.

**How:**
- iOS: `window.webkit.messageHandlers` bridge or React Native health kit
- Android: Google Fit REST API
- Button on result: "Log this meal" → writes calories, protein, carbs, fat
- Requires native app wrapper (React Native or Capacitor) for full integration

**Impact:** Strongest retention hook. Users return daily to log meals.

---

## 🏪 Retail & Catalog Intelligence

### 8. Healthier Swap Suggestion
**What:** After scanning a product, show one healthier alternative from the same catalog.

**How:**
- After catalog lookup: query `MOCK_CATALOG` (later Qdrant) for same category, lower calories/sugar
- New section on result: "Healthier Option: [Product Name] — saves 80 kcal"
- No Gemini needed for catalog products

**MVP4 approach:** Simple rule-based comparison (same category, better nutrition score).
**MVP5 approach:** Qdrant semantic similarity + nutrition filter.

---

### 9. Price-per-Nutrition Score
**What:** When catalog has pricing, rank products by nutritional efficiency (protein per dollar, calories per dollar).

**How:**
- Requires `price` field in `food_details` MongoDB collection (MVP2)
- Compute: `nutrition_score = protein_g / price`, `value_score = calories / price`
- Display as a badge: `💰 Great Value` / `⚖️ Average` / `💸 Premium`

---

### 10. Smart Reorder Suggestion
**What:** Track which products a user scans repeatedly → suggest reorder when pattern suggests they're running low.

**How:**
- Scan history stored with `upc` + `timestamp`
- Detect pattern: same UPC scanned every ~7 days
- Notification / banner: "You usually buy Horizon Milk around now. Add to list?"
- Requires scan history persistence (localStorage for MVP4, MongoDB for MVP5)

---

### 11. Carbon Footprint Tag
**What:** Show estimated CO₂ emissions per food item alongside nutrition.

**How:**
- Pre-built dataset: Our World in Data food carbon footprint (public, free)
- Map dish category → kg CO₂ per serving
- Display: `🌱 Low impact` / `⚠️ Medium` / `🔴 High impact` badge on overlay
- No AI needed — static lookup table

**Impact:** Strong brand differentiator for eco-conscious retail brands.

---

## 🤖 AI Enhancements

### 12. Restaurant Menu Scanner
**What:** Point camera at a printed or digital menu → Gemini reads all dish names → bulk-fetches nutrition.

**How:**
- New Gemini prompt: OCR mode to extract all dish names from menu image
- New endpoint: `POST /api/menu/scan` → `{ base64_image }` → `{ dishes: [{ name, nutrition }] }`
- Frontend: scrollable list of all dishes with nutrition, filterable by dietary profile

**Impact:** Completely new use case — dining out. No competitor does this at catalog level.

---

### 13. Fridge Scanner Mode
**What:** Scan your open fridge → Gemini identifies all visible items → suggests recipes using what you have.

**How:**
- New Gemini prompt: identify all food items visible in image
- New endpoint: `POST /api/fridge/scan` → `{ base64_image }` → `{ items: string[], recipe_suggestions: string[] }`
- Frontend: new "Fridge" tab alongside Scan / Ask

---

### 14. Freshness Detection
**What:** For fruits and vegetables — visual analysis of color and texture → ripeness estimate.

**How:**
- New Gemini prompt focused on freshness: `{ item, freshness_status, recommendation }`
- `freshness_status`: `underripe | perfect | overripe | spoiled`
- Badge on overlay for produce items

---

### 15. Nutritional Comparison Mode
**What:** Scan two products back-to-back → side-by-side nutrition comparison.

**How:**
- "Compare" mode toggle in scan tab
- First scan stored as `compareItem`
- Second scan triggers comparison view
- Side-by-side: calories, protein, carbs, fat, sugar — winner highlighted in green

---

## 📱 Platform & Distribution

### 16. Progressive Web App (PWA) + Offline Mode
**What:** Cache top 500 catalog products locally. App works without internet for known products.

**How:**
- Service worker with Workbox
- Pre-cache `MOCK_CATALOG` (later top-500 MongoDB products) at install time
- Gemini only called for cache misses
- "You're offline — showing cached results" banner

---

### 17. Export & Share
**What:**
- Export full day's nutrition log as PDF or CSV
- Share a single scan as a styled image card to WhatsApp / Instagram

**How:**
- PDF: `jspdf` + `html2canvas` to snapshot the nutrition panel
- Image card: `html2canvas` on the result overlay → `navigator.share` with blob
- CSV: serialize `ScanLog[]` to comma-separated string → download

---

### 18. Voice Mode
**What:** Hands-free scanning — speak dish name → Gemini responds with nutrition read aloud.

**How:**
- `SpeechRecognition` Web API for input
- `SpeechSynthesis` Web API for output
- Wires into existing `POST /api/ask` endpoint
- New mic button in Ask mode

---

### 19. Browser Extension
**What:** User visits a food delivery app or restaurant website → extension injects nutrition overlay on menu items.

**How:**
- Chrome Extension (Manifest V3)
- Content script detects food item names on page
- Calls FoodLens `/api/ask` for each dish name
- Injects small nutrition badge next to each dish

**Impact:** Entirely new distribution channel. No code changes to main app.

---

## 🌟 Biggest Differentiator

### 20. Retail-Aware Meal Planning
**What:** "Plan my meals for the week using only products available in Store #42."

The only feature impossible for a generic food app — requires the catalog integration.

**Flow:**
```
User sets: dietary profile + weekly calorie target + store_id
         │
         ▼
FoodLens queries catalog for available products
         │
         ▼
Gemini generates 7-day meal plan using only catalog products
         │
         ▼
Each meal → full nutrition breakdown
Each ingredient → BPN from catalog
         │
         ▼
One-tap → full week's shopping list (ready for MVP3 cart flow)
```

**How:**
- New endpoint: `POST /api/meal-plan` → `{ store_id, dietary_profile, calorie_target, days }`
- Gemini prompt: inject catalog product list as context (RAG from MVP2 Qdrant)
- Response: structured 7-day plan with meals, nutrition totals, and shopping list

---

## Suggested Build Order

| Phase | Features | Effort |
|---|---|---|
| **MVP4a** | Barcode Scanner + Portion Adjuster + Daily Tracker | Low |
| **MVP4b** | Dietary Profile + Healthier Swap + Expiry Detection | Medium |
| **MVP4c** | Multi-dish Detection + Nutritional Comparison + Export/Share | Medium |
| **MVP4d** | Restaurant Menu Scanner + Fridge Scanner + Freshness | High |
| **MVP5** | Retail-Aware Meal Planning + Health Platform Sync + PWA | High |
| **MVP6** | Voice Mode + Browser Extension + Carbon Footprint | High |

---

## Dependencies on Prior MVPs

| Feature | Requires |
|---|---|
| Barcode Scanner | MVP1 (UPC field already in schema) |
| Healthier Swap | MVP2 (MongoDB catalog with categories) |
| Price-per-Nutrition | MVP2 (price field in food_details) |
| Smart Reorder | MVP2 (scan history in MongoDB) |
| Retail-Aware Meal Planning | MVP2 (Qdrant RAG) + MVP3 (shopping list) |
| Carbon Footprint | MVP1 (dish_name field — static lookup) |
| All others | MVP1 only |
