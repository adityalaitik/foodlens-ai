export type Allergen = 'dairy' | 'nuts' | 'gluten' | 'soy' | 'eggs'

export type Confidence = 'high' | 'medium' | 'low'

export interface NutritionFacts {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  sodium_mg: number
}

export interface FoodAnalysis {
  dish_name: string
  ingredients: string[]
  nutrition: NutritionFacts
  allergens: Allergen[]
  confidence: Confidence
}

export interface AnalyzeImageRequest {
  base64_image: string
}

export interface AskDishRequest {
  dish_name: string
}

export type AppMode = 'scan' | 'ask'
