# FoodLens AI — MVP3: Shop Ingredients from Dish Scan

## Overview
After scanning a dish and seeing the food details overlay, the user can tap a "Shop Ingredients" button.
The app maps each ingredient to a catalog product, lets the user select items, and builds a shopping list.
No actual checkout in MVP3 — that bridge is laid for MVP4.

---

## Full Flow

```
User taps capture → dish analysis appears in overlay
         │
         ▼
"🛒 Shop Ingredients" button appears on overlay
         │
         ▼
User taps → Bottom drawer slides up
         │
         ▼
POST /api/ingredients/match called with dish ingredients + store_id
         │
  ┌──────┴──────────┐
Found in catalog    Not found
  │                    │
Product card          "Sourced externally" badge
(name, quantity)
         │
         ▼
User selects / deselects items
         │
         ▼
"Add to Shopping List" → Summary screen
```

---

## UI Design

### Step 1 — Trigger Button on Overlay

When a scan result exists, a second action row appears below allergens in `LiveOverlay`:

```
┌──────────────────────────────────────────┐
│  Butter Chicken                   [high] │
│  🔥 450kcal · 💪 25g · 🌾 40g · 🧈 18g  │
│  Contains: 🥛 🌾                         │
│  [ 🛒 Shop Ingredients ]                 │
└──────────────────────────────────────────┘
```

---

### Step 2 — Ingredient Drawer

Bottom sheet slides up (Framer Motion spring, same pattern as ResultPanel):

```
┌─────────────────────────────────────────────┐
│  ▬▬▬▬▬                                      │
│  🛒 Ingredients for Butter Chicken           │
│─────────────────────────────────────────────│
│  ✅  Chicken Breast   →  Tyson Boneless      │
│  ✅  Heavy Cream      →  Organic Valley      │
│  ✅  Tomato Paste     →  Hunt's Tomato Paste │
│  ⬜  Garam Masala     →  Not in catalog      │
│  ✅  Basmati Rice     →  Mahatma Rice        │
│─────────────────────────────────────────────│
│  [Select All]              4 of 5 selected  │
│  ─────────────────────────────────────────  │
│  [      Add to Shopping List      ]         │
└─────────────────────────────────────────────┘
```

- Green checkbox = found in catalog, pre-selected
- Grey checkbox = not found, deselected by default
- Each row shows: ingredient name + matched product name
- "Not in catalog" badge for unmatched items

---

### Step 3 — Shopping List View

Full-screen or tall modal after tapping "Add to Shopping List":

```
┌─────────────────────────────────────────────┐
│  ← Back         Shopping List               │
│─────────────────────────────────────────────│
│  ☑  Tyson Boneless Chicken        1 pack    │
│  ☑  Organic Valley Heavy Cream    1 carton  │
│  ☑  Hunt's Tomato Paste           1 can     │
│  ☑  Mahatma Basmati Rice          1 bag     │
│─────────────────────────────────────────────│
│  4 items                                    │
│  [ 📤 Share List ]    [ 🗑 Clear ]           │
└─────────────────────────────────────────────┘
```

- Share button → native share sheet (navigator.share) with plain text list
- Items persist in localStorage between sessions
- Clear button wipes the list

---

## Backend

### New Endpoint

**`POST /api/ingredients/match`**

Request:
```json
{
  "ingredients": ["chicken breast", "heavy cream", "tomato paste", "garam masala"],
  "store_id": "store1"
}
```

Response:
```json
[
  {
    "ingredient": "chicken breast",
    "matched": true,
    "product": {
      "dish_name": "Tyson Boneless Skinless Chicken Breast",
      "upc": "0023700031298",
      "bpn": "0023700031298_store1",
      "allergens": []
    }
  },
  {
    "ingredient": "garam masala",
    "matched": false,
    "product": null
  }
]
```

Matching logic (MVP3 — mock catalog):
- For each ingredient → fuzzy search `MOCK_CATALOG` dict by `dish_name` field (`lower() in`)
- One API call for all ingredients — no per-ingredient Gemini calls
- Returns matched + unmatched in order

---

## New Files

### Frontend

| File | Purpose |
|---|---|
| `frontend/components/shop/ShopDrawer.tsx` | Bottom sheet — ingredient list with catalog matches, checkboxes, "Add to List" CTA |
| `frontend/components/shop/IngredientRow.tsx` | Single row: ingredient name + matched product + checkbox toggle |
| `frontend/components/shop/ShoppingList.tsx` | Final selected items view with Share + Clear actions |
| `frontend/hooks/useShopIngredients.ts` | Calls `POST /api/ingredients/match`, manages per-ingredient selection state |

### Backend

| File | Purpose |
|---|---|
| `backend/routers/ingredients.py` | `POST /api/ingredients/match` route |
| `backend/controllers/ingredients_controller.py` | Batch fuzzy match against `MOCK_CATALOG`, returns match results |
| `backend/schemas/ingredients_schema.py` | `IngredientsMatchRequest`, `IngredientMatchResult`, `IngredientsMatchResponse` |

---

## Modified Files

### Frontend

| File | Change |
|---|---|
| `frontend/components/camera/LiveOverlay.tsx` | Add "🛒 Shop Ingredients" button row when result is present |
| `frontend/app/page.tsx` | Mount `ShopDrawer` and `ShoppingList` in scan mode |
| `frontend/store/useFoodStore.ts` | Add `shopDrawerOpen`, `shoppingList`, `setShopDrawerOpen`, `addToShoppingList`, `clearShoppingList` |
| `frontend/types/index.ts` | Add `MatchedProduct`, `IngredientMatch`, `ShoppingListItem` types |

### Backend

| File | Change |
|---|---|
| `backend/main.py` | Register ingredients router at prefix `/api` |

---

## Type Definitions (Frontend)

```typescript
interface MatchedProduct {
  dish_name: string
  upc: string
  bpn: string
  allergens: Allergen[]
}

interface IngredientMatch {
  ingredient: string
  matched: boolean
  product: MatchedProduct | null
}

interface ShoppingListItem {
  ingredient: string
  product: MatchedProduct
  quantity: string      // e.g. "1 pack", "1 carton"
  selected: boolean
}
```

---

## Zustand Store Additions

```typescript
interface FoodStore {
  // ... existing fields ...
  shopDrawerOpen: boolean
  shoppingList: ShoppingListItem[]
  setShopDrawerOpen: (val: boolean) => void
  addToShoppingList: (items: ShoppingListItem[]) => void
  clearShoppingList: () => void
}
```

Shopping list is also persisted to `localStorage` via Zustand persist middleware.

---

## MVP3 → MVP4 Bridge

In MVP3 the "Add to Shopping List" stores items locally only.

In MVP4 the bridge is already in place — each `ShoppingListItem` carries `upc` and `bpn`, which are exactly the identifiers needed to:
- Call a cart/checkout API: `POST /cart/add { upc, store_id, quantity }`
- Link to a product detail page: `/product/{upc}`
- Trigger an order flow

No schema changes needed between MVP3 and MVP4 — just wire up the existing data to a real cart API.

---

## Verification

1. Scan a dish → food overlay appears with "🛒 Shop Ingredients" button
2. Tap button → drawer slides up, ingredients listed with catalog matches
3. `POST /api/ingredients/match` visible in backend logs, no Gemini call for matched items
4. Toggle individual items → selected count updates
5. Tap "Add to Shopping List" → summary screen shows selected items
6. Tap "Share List" → native share sheet opens with plain text ingredient list
7. Refresh page → shopping list persists (localStorage)
8. Tap "Clear" → list empties
