# FoodLens AI - Frontend

A mobile-first real-time food scanner app built with Next.js 14, TypeScript, and Tailwind CSS. This is a **frontend-only** application that communicates with an external Python FastAPI backend for AI-powered food analysis.

## 🎯 Features

- **📷 Scan Food**: Real-time camera feed with one-tap image capture
- **💬 Ask AI**: Text-based dish name lookup for instant nutritional info
- **🥗 Ingredient Analysis**: Detailed ingredient lists with visual indicators
- **🔥 Calorie Tracking**: Beautiful animated calorie ring visualization
- **⚠️ Allergen Detection**: Color-coded allergen warnings (dairy, nuts, gluten, soy, eggs)
- **📱 Mobile First**: Fully responsive dark theme UI optimized for mobile devices

## 📋 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Zustand** for global state management
- **Axios** for HTTP requests
- **Framer Motion** for smooth animations

## 📁 Project Structure

```
app/
├── layout.tsx           # Root layout with dark theme
├── page.tsx             # Main scanner page
├── history/
│   └── page.tsx         # Scan history (placeholder)
└── settings/
    └── page.tsx         # User settings (placeholder)

components/
├── camera/
│   ├── CameraView.tsx       # Live video feed with LIVE indicator
│   └── CaptureButton.tsx    # Animated capture button with flash effect
├── results/
│   ├── ResultPanel.tsx      # Slide-up bottom drawer with results
│   ├── IngredientList.tsx   # Staggered ingredient animations
│   ├── CalorieCard.tsx      # Animated circular progress ring
│   └── AllergenBadges.tsx   # Color-coded allergen indicators
├── ask/
│   └── AskMode.tsx          # Text input with recent searches
└── ui/
    ├── LoadingSkeleton.tsx   # Shimmer loading state
    ├── ErrorCard.tsx        # Error display component
    └── TabSwitcher.tsx      # Scan/Ask tab toggle

hooks/
├── useCamera.ts         # Camera access with getUserMedia
├── useFrameCapture.ts   # Canvas-based frame capture
└── useAnalyze.ts        # Backend API integration

lib/
├── apiClient.ts         # Axios instance with base URL
└── imageUtils.ts        # Canvas to base64 conversion

store/
└── useFoodStore.ts      # Zustand state management

types/
└── index.ts             # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python FastAPI backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
pnpm install

# Create .env.local (already included)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

## 🔌 API Endpoints

The app communicates with a FastAPI backend:

- **POST `/api/analyze`** - Analyzes food image
  ```json
  {
    "base64_image": "string (base64 JPEG without prefix)"
  }
  ```

- **POST `/api/ask`** - Gets dish information by name
  ```json
  {
    "dish_name": "string"
  }
  ```

### Response Format

```json
{
  "dish_name": "Butter Chicken",
  "ingredients": ["chicken", "butter", "tomato sauce", "cream"],
  "calories": {
    "per_serving": 450,
    "unit": "kcal"
  },
  "allergens": ["dairy"],
  "confidence": "high"
}
```

## 🎮 Usage

### Scan Mode
1. Open the app on a mobile device
2. The camera automatically starts with back camera (environment facing)
3. Tap the capture button to snap a photo
4. Results slide up from the bottom with:
   - Dish name and confidence level
   - Tabs for ingredients, calories, allergens
   - Detailed nutritional information

### Ask Mode
1. Switch to the "💬 Ask AI" tab
2. Type a dish name (e.g., "Butter Chicken")
3. Tap Search or press Enter
4. Recent searches are saved to localStorage
5. Same detailed results displayed in the slide-up panel

## 🎨 Design System

### Dark Theme
- Background: `#0a0a0a` (near black)
- Cards: `#1a1a1a` with white/5 transparency
- Accent: `#22c55e` (green for active states)
- Text: White with opacity variations

### Components
- All cards use `rounded-2xl` with subtle borders
- Glass morphism effects with `backdrop-blur-lg`
- Smooth transitions (150-300ms)
- Mobile-first responsive design (max-width: 430px)

## 🔄 State Management

The app uses Zustand for global state:

```typescript
interface FoodStore {
  result: FoodAnalysis | null
  isLoading: boolean
  error: string | null
  mode: 'scan' | 'ask'
  setResult: (result: FoodAnalysis) => void
  setLoading: (val: boolean) => void
  setError: (msg: string | null) => void
  setMode: (mode: AppMode) => void
  clearResult: () => void
}
```

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛡️ Best Practices Implemented

- ✅ TypeScript strict mode (no `any` types)
- ✅ Client components marked with `'use client'`
- ✅ Semantic HTML with proper ARIA roles
- ✅ Error handling for camera permission denied
- ✅ Network error handling for backend failures
- ✅ Mobile-first responsive design
- ✅ Accessibility-first UI patterns
- ✅ Performance optimized animations

## 📱 Mobile Optimizations

- Back camera (environment facing mode)
- No horizontal scrolling
- Touch-friendly button sizes
- Viewport settings disable user zoom scaling
- Full viewport coverage with `viewport-fit: cover`
- Status bar aware layout

## 🐛 Error Handling

The app gracefully handles:
- Camera permission denied
- Backend API unavailable
- Invalid image/dish data
- Network timeouts (30s)
- Missing or incomplete API responses

## 📝 Notes

- Camera auto-starts on page load
- Result panel overlays camera (doesn't unmount it)
- Recent searches persist in localStorage
- Base64 images sent without the `data:image/jpeg;base64,` prefix
- All UI animations use Framer Motion for smooth performance

## 🔗 Backend Integration

This frontend expects a Python FastAPI backend with:
- CORS enabled for `http://localhost:3000`
- Image analysis endpoint (`/api/analyze`)
- Dish lookup endpoint (`/api/ask`)
- Response validation matching the `FoodAnalysis` type

Ensure your backend is running before starting the dev server.
