// General nutrition guidance per goal (same ids as WORKOUTS).
export const NUTRITION = {
  "weight-loss": {
    summary: "Aim for a modest calorie deficit with high protein and plenty of fibre to stay full.",
    tips: [
      "Fill half your plate with vegetables",
      "Choose boiled or grilled over fried",
      "Drink water before meals",
      "Limit sugary drinks and snacks",
    ],
    foods: [
      { name: "Sukuma wiki / spinach", why: "Low calorie, high fibre and iron" },
      { name: "Eggs (boiled)", why: "Cheap, filling protein" },
      { name: "Beans / lentils", why: "Protein and fibre in one" },
      { name: "Grilled fish (tilapia, omena)", why: "Lean protein" },
      { name: "Fruit (pawpaw, oranges)", why: "Sweet fix with vitamins" },
    ],
  },
  "muscle-building": {
    summary: "Eat in a slight calorie surplus with 1.6-2.2 g protein per kg of body weight.",
    tips: [
      "Spread protein across 4-5 meals",
      "Eat carbs before and after training",
      "Don't skip rest days or sleep",
      "Add healthy fats like avocado",
    ],
    foods: [
      { name: "Chicken / beef", why: "Complete protein" },
      { name: "Eggs", why: "Protein plus healthy fats" },
      { name: "Milk / yoghurt", why: "Protein and calcium" },
      { name: "Rice, ugali, sweet potato", why: "Energy for heavy sessions" },
      { name: "Groundnuts / peanut butter", why: "Calorie-dense healthy fats" },
    ],
  },
  strength: {
    summary: "Fuel heavy lifts with enough carbs and protein, and keep meals regular.",
    tips: [
      "Eat a carb-rich meal 2-3 hours before lifting",
      "Get protein within a few hours after training",
      "Stay hydrated through the session",
      "Don't train fasted on heavy days",
    ],
    foods: [
      { name: "Oats / porridge", why: "Slow-release energy" },
      { name: "Beef / goat", why: "Protein, iron and creatine" },
      { name: "Githeri", why: "Carbs and protein, budget friendly" },
      { name: "Bananas", why: "Quick pre-workout carbs and potassium" },
      { name: "Greek yoghurt / mala", why: "Protein for recovery" },
    ],
  },
  cardio: {
    summary: "Prioritise carbohydrates for endurance and replace fluids and electrolytes.",
    tips: [
      "Carb-based snack 1 hour before cardio",
      "Sip water during longer sessions",
      "Refuel with carbs + protein after",
      "Add salt/electrolytes on hot days",
    ],
    foods: [
      { name: "Bananas", why: "Fast carbs and potassium" },
      { name: "Rice / pasta", why: "Glycogen stores" },
      { name: "Oats", why: "Sustained energy" },
      { name: "Coconut water", why: "Natural electrolytes" },
      { name: "Boiled eggs / chicken", why: "Recovery protein" },
    ],
  },
  "general-fitness": {
    summary: "Eat a balanced plate: carbs for energy, protein for repair, vegetables for micronutrients.",
    tips: [
      "Follow the plate rule: 1/2 veg, 1/4 protein, 1/4 carbs",
      "Eat regular meals, don't skip breakfast",
      "Drink 2-3 litres of water a day",
      "Keep processed snacks occasional",
    ],
    foods: [
      { name: "Ugali + sukuma + beans", why: "Classic balanced meal" },
      { name: "Fruit and vegetables", why: "Vitamins, minerals, fibre" },
      { name: "Eggs / fish / chicken", why: "Protein variety" },
      { name: "Nuts and seeds", why: "Healthy fats" },
      { name: "Whole grain bread / brown rice", why: "Steady energy" },
    ],
  },
};