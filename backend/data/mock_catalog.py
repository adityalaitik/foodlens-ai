# Simulates catalog service product data keyed by UPC.
# Replace this dict with real MongoDB + Qdrant queries in MVP2.

MOCK_CATALOG: dict[str, dict] = {
    "0041303014110": {
        "bpn": "0041303014110_store1",
        "dish_name": "Horizon Organic Whole Milk",
        "ingredients": [
            "Organic Grade A Whole Milk", "Vitamin D3"
        ],
        "nutrition": {
            "calories": 150, "protein_g": 8.0, "carbs_g": 12.0,
            "fat_g": 8.0, "fiber_g": 0.0, "sugar_g": 12.0, "sodium_mg": 125.0
        },
        "allergens": ["dairy"],
        "confidence": "high",
        "source": "catalog",
    },
    "0043000200605": {
        "bpn": "0043000200605_store1",
        "dish_name": "Tropicana Pure Premium Orange Juice",
        "ingredients": [
            "Pure Squeezed Pasteurized Orange Juice"
        ],
        "nutrition": {
            "calories": 110, "protein_g": 2.0, "carbs_g": 26.0,
            "fat_g": 0.0, "fiber_g": 0.0, "sugar_g": 22.0, "sodium_mg": 0.0
        },
        "allergens": [],
        "confidence": "high",
        "source": "catalog",
    },
    "0011110873927": {
        "bpn": "0011110873927_store1",
        "dish_name": "Sara Lee Classic White Bread",
        "ingredients": [
            "Enriched Bleached Flour", "Water", "High Fructose Corn Syrup",
            "Yeast", "Soybean Oil", "Salt", "Dough Conditioners"
        ],
        "nutrition": {
            "calories": 130, "protein_g": 4.0, "carbs_g": 26.0,
            "fat_g": 1.5, "fiber_g": 1.0, "sugar_g": 3.0, "sodium_mg": 230.0
        },
        "allergens": ["gluten", "soy"],
        "confidence": "high",
        "source": "catalog",
    },
    "0021130126026": {
        "bpn": "0021130126026_store1",
        "dish_name": "Large Grade A White Eggs (12 ct)",
        "ingredients": ["Eggs"],
        "nutrition": {
            "calories": 70, "protein_g": 6.0, "carbs_g": 0.0,
            "fat_g": 5.0, "fiber_g": 0.0, "sugar_g": 0.0, "sodium_mg": 70.0
        },
        "allergens": ["eggs"],
        "confidence": "high",
        "source": "catalog",
    },
    "0028400090322": {
        "bpn": "0028400090322_store1",
        "dish_name": "Lay's Classic Potato Chips",
        "ingredients": [
            "Potatoes", "Vegetable Oil (Sunflower, Corn, or Canola Oil)", "Salt"
        ],
        "nutrition": {
            "calories": 160, "protein_g": 2.0, "carbs_g": 15.0,
            "fat_g": 10.0, "fiber_g": 1.0, "sugar_g": 0.0, "sodium_mg": 170.0
        },
        "allergens": [],
        "confidence": "high",
        "source": "catalog",
    },
    "0016000275607": {
        "bpn": "0016000275607_store1",
        "dish_name": "Cheerios Original Oat Cereal",
        "ingredients": [
            "Whole Grain Oats", "Modified Corn Starch", "Sugar",
            "Salt", "Calcium Carbonate", "Vitamins and Minerals"
        ],
        "nutrition": {
            "calories": 100, "protein_g": 3.0, "carbs_g": 20.0,
            "fat_g": 2.0, "fiber_g": 3.0, "sugar_g": 1.0, "sodium_mg": 140.0
        },
        "allergens": ["gluten"],
        "confidence": "high",
        "source": "catalog",
    },
    "0013000006408": {
        "bpn": "0013000006408_store1",
        "dish_name": "Oreo Original Chocolate Sandwich Cookies",
        "ingredients": [
            "Unbleached Enriched Flour", "Sugar", "Palm and/or Canola Oil",
            "Cocoa", "High Fructose Corn Syrup", "Leavening", "Salt",
            "Soy Lecithin", "Chocolate", "Artificial Flavor"
        ],
        "nutrition": {
            "calories": 160, "protein_g": 2.0, "carbs_g": 25.0,
            "fat_g": 7.0, "fiber_g": 1.0, "sugar_g": 14.0, "sodium_mg": 135.0
        },
        "allergens": ["gluten", "soy"],
        "confidence": "high",
        "source": "catalog",
    },
    "0052000042234": {
        "bpn": "0052000042234_store1",
        "dish_name": "Heinz Tomato Ketchup",
        "ingredients": [
            "Tomato Concentrate", "Distilled Vinegar", "High Fructose Corn Syrup",
            "Corn Syrup", "Salt", "Spice", "Onion Powder", "Natural Flavoring"
        ],
        "nutrition": {
            "calories": 20, "protein_g": 0.0, "carbs_g": 5.0,
            "fat_g": 0.0, "fiber_g": 0.0, "sugar_g": 4.0, "sodium_mg": 160.0
        },
        "allergens": [],
        "confidence": "high",
        "source": "catalog",
    },
    "0070253261020": {
        "bpn": "0070253261020_store1",
        "dish_name": "Chobani Plain Greek Yogurt (Non-fat)",
        "ingredients": [
            "Nonfat Milk", "Live and Active Cultures (S. Thermophilus, L. Bulgaricus, L. Acidophilus, Bifidus, L. Casei)"
        ],
        "nutrition": {
            "calories": 90, "protein_g": 16.0, "carbs_g": 7.0,
            "fat_g": 0.0, "fiber_g": 0.0, "sugar_g": 6.0, "sodium_mg": 65.0
        },
        "allergens": ["dairy"],
        "confidence": "high",
        "source": "catalog",
    },
    "0034000020034": {
        "bpn": "0034000020034_store1",
        "dish_name": "Skippy Creamy Peanut Butter",
        "ingredients": [
            "Roasted Peanuts", "Sugar", "Hydrogenated Vegetable Oils (Cottonseed, Soybean, and Rapeseed)",
            "Salt"
        ],
        "nutrition": {
            "calories": 190, "protein_g": 7.0, "carbs_g": 7.0,
            "fat_g": 16.0, "fiber_g": 2.0, "sugar_g": 3.0, "sodium_mg": 150.0
        },
        "allergens": ["nuts", "soy"],
        "confidence": "high",
        "source": "catalog",
    },
}
