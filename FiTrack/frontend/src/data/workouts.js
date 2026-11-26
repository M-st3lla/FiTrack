// Workout categories. `burn` = rough average calories burned per session.
export const TRAINING_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Pro" },
];

export const getTrainingLevelLabel = (value) =>
  TRAINING_LEVELS.find((level) => level.value === value)?.label ?? "Beginner";

export const WORKOUTS = [
  {
    id: "weight-loss",
    name: "Weight Loss",
    image: "https://images.pexels.com/photos/6998798/pexels-photo-6998798.jpeg?auto=compress&cs=tinysrgb&w=1200",
    level: "beginner",
    duration: 45,
    burn: 400,
    desc: "High-calorie-burn sessions mixing cardio and circuits to create a steady calorie deficit.",
    exercises: [
      { name: "Brisk walk / jog intervals", detail: "5 min warm-up, 8 x (1 min jog + 1 min walk)" },
      { name: "Jump rope", detail: "4 x 1 min, 30 sec rest" },
      { name: "Bodyweight squats", detail: "3 x 15" },
      { name: "Mountain climbers", detail: "3 x 30 sec" },
      { name: "Burpees", detail: "3 x 10" },
    ],
  },
  {
    id: "muscle-building",
    name: "Muscle Building",
    image: "https://images.pexels.com/photos/6455911/pexels-photo-6455911.jpeg?auto=compress&cs=tinysrgb&w=1200",
    level: "intermediate",
    duration: 60,
    burn: 350,
    desc: "Hypertrophy-focused lifting with moderate reps and progressive overload.",
    exercises: [
      { name: "Bench press", detail: "4 x 8-10" },
      { name: "Barbell row", detail: "4 x 8-10" },
      { name: "Overhead press", detail: "3 x 10" },
      { name: "Leg press / squat", detail: "4 x 10" },
      { name: "Bicep curls + triceps dips", detail: "3 x 12 each" },
    ],
  },
  {
    id: "strength",
    name: "Strength Training",
    image: "https://images.pexels.com/photos/38453122/pexels-photo-38453122/free-photo-of-strongman-lifting-weights-at-the-gym.jpeg?auto=compress&cs=tinysrgb&w=1200",
    level: "advanced",
    duration: 60,
    burn: 300,
    desc: "Heavy compound lifts with low reps and long rests to build raw strength.",
    exercises: [
      { name: "Back squat", detail: "5 x 5" },
      { name: "Deadlift", detail: "3 x 5" },
      { name: "Bench press", detail: "5 x 5" },
      { name: "Pull-ups", detail: "4 x max reps" },
      { name: "Plank", detail: "3 x 45 sec" },
    ],
  },
  {
    id: "cardio",
    name: "Cardio",
    image: "https://images.pexels.com/photos/6388983/pexels-photo-6388983.jpeg?auto=compress&cs=tinysrgb&w=1200",
    level: "intermediate",
    duration: 40,
    burn: 450,
    desc: "Heart-rate-driven sessions to improve stamina and cardiovascular health.",
    exercises: [
      { name: "Treadmill run", detail: "20 min steady pace" },
      { name: "Stationary bike", detail: "10 min intervals" },
      { name: "Rowing machine", detail: "8 min moderate" },
      { name: "High knees", detail: "3 x 40 sec" },
      { name: "Cool-down walk + stretch", detail: "5 min" },
    ],
  },
  {
    id: "general-fitness",
    name: "General Fitness",
    image: "https://images.pexels.com/photos/6455898/pexels-photo-6455898.jpeg?auto=compress&cs=tinysrgb&w=1200",
    level: "beginner",
    duration: 45,
    burn: 300,
    desc: "A balanced mix of strength, cardio and mobility to stay active and healthy.",
    exercises: [
      { name: "Dynamic warm-up", detail: "5 min" },
      { name: "Push-ups", detail: "3 x 10" },
      { name: "Goblet squats", detail: "3 x 12" },
      { name: "Dumbbell rows", detail: "3 x 12" },
      { name: "Light jog + stretching", detail: "10 min" },
    ],
  },
];

export const getWorkout = (id) => WORKOUTS.find((w) => w.id === id);