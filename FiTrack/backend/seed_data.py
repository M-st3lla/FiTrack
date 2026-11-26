"""Starter content: workout categories, exercises and nutrition tips."""

# category name -> (description, exercises, nutrition tips)
# exercise tuple: (name, description, sets, reps, duration_min)
# tip tuple: (title, foods, description)
CATALOGUE = {
    "Strength Training": (
        "Build raw strength with heavy, low-rep compound lifts.",
        [
            ("Barbell Squat", "Bar on upper back, squat to parallel and drive up.", 4, 6, None),
            ("Deadlift", "Lift the bar from the floor keeping a neutral spine.", 4, 5, None),
            ("Bench Press", "Lower the bar to mid-chest and press up.", 4, 6, None),
            ("Overhead Press", "Press the bar from shoulders to overhead.", 3, 8, None),
            ("Barbell Row", "Hinge forward and row the bar to your lower ribs.", 4, 8, None),
        ],
        [
            ("Protein at every meal", "Chicken, eggs, beef, beans, lentils, fish",
             "Aim for roughly 1.6-2.2 g of protein per kg of body weight to support recovery."),
            ("Fuel heavy sessions", "Rice, ugali, oats, sweet potato, bananas",
             "Eat complex carbohydrates 2-3 hours before lifting for steady energy."),
            ("Stay hydrated", "Water, electrolyte drinks",
             "Drink water throughout the day and during training."),
        ],
    ),
    "Cardio": (
        "Improve heart health and endurance with sustained aerobic work.",
        [
            ("Steady-State Run", "Run at a conversational pace.", None, None, 30),
            ("Cycling", "Moderate-resistance cycling on a bike or machine.", None, None, 30),
            ("Jump Rope", "Intervals of 1 minute on, 30 seconds rest.", 6, None, 10),
            ("Rowing Machine", "Smooth, powerful strokes at a steady rate.", None, None, 20),
            ("Stair Climber", "Climb at a challenging but sustainable pace.", None, None, 15),
        ],
        [
            ("Carbs for endurance", "Oats, bananas, rice, whole-grain bread",
             "Carbohydrates are the main fuel for longer cardio sessions."),
            ("Replace fluids", "Water, coconut water, electrolyte drinks",
             "Sweat loss is higher in cardio, so rehydrate during and after."),
            ("Light pre-run snack", "Banana, toast with honey",
             "A small snack 30-60 minutes before avoids stomach discomfort."),
        ],
    ),
    "Weight Loss": (
        "Burn more calories than you eat using a mix of cardio and full-body circuits.",
        [
            ("HIIT Circuit", "30 seconds all-out, 30 seconds rest across 6 moves.", 5, None, 20),
            ("Brisk Walking", "Fast incline walking.", None, None, 40),
            ("Burpees", "Full-body explosive movement.", 4, 12, None),
            ("Kettlebell Swings", "Hip-hinge swing to chest height.", 4, 15, None),
            ("Mountain Climbers", "Drive knees to chest in a plank.", 4, 30, None),
        ],
        [
            ("Moderate calorie deficit", "Vegetables, lean protein, fruit, whole grains",
             "A deficit of about 300-500 kcal/day supports steady, sustainable fat loss."),
            ("High-fibre foods", "Beans, leafy greens, oats, berries",
             "Fibre keeps you fuller for longer."),
            ("Limit liquid calories", "Water, unsweetened tea",
             "Sugary drinks add calories quickly without filling you up."),
        ],
    ),
    "Muscle Building": (
        "Grow muscle size with moderate-rep, higher-volume training.",
        [
            ("Dumbbell Bench Press", "Press dumbbells from chest level.", 4, 10, None),
            ("Lat Pulldown", "Pull the bar to upper chest, squeezing the lats.", 4, 10, None),
            ("Leg Press", "Full range of motion, controlled tempo.", 4, 12, None),
            ("Dumbbell Curl", "Curl without swinging the torso.", 3, 12, None),
            ("Triceps Pushdown", "Keep elbows pinned to your sides.", 3, 12, None),
        ],
        [
            ("Small calorie surplus", "Rice, pasta, nuts, avocado, whole milk",
             "Eating about 250-500 kcal above maintenance supports muscle growth."),
            ("Protein spread through the day", "Eggs, fish, chicken, yoghurt, tofu",
             "Spread protein over 3-5 meals."),
            ("Post-workout meal", "Chicken and rice, milk, eggs on toast",
             "Protein plus carbs within a couple of hours of training aids recovery."),
        ],
    ),
    "General Fitness": (
        "A balanced mix of strength, cardio and mobility for overall health.",
        [
            ("Bodyweight Squats", "Chest up, sit back and down.", 3, 15, None),
            ("Push-Ups", "Keep a straight line from head to heels.", 3, 10, None),
            ("Plank", "Hold a rigid forearm plank.", 3, None, 1),
            ("Jogging", "Easy-pace jog.", None, None, 20),
            ("Stretching & Mobility", "Full-body stretch routine.", None, None, 10),
        ],
        [
            ("Balanced plate", "Vegetables, whole grains, lean protein, healthy fats",
             "Fill half your plate with vegetables, a quarter with protein and a quarter with carbs."),
            ("Eat regularly", "Fruit, nuts, yoghurt, whole-grain snacks",
             "Regular meals keep energy steady through the day."),
            ("Sleep and recovery", "Water, magnesium-rich foods such as nuts and greens",
             "7-9 hours of sleep is as important as the food you eat."),
        ],
    ),
}


def seed(db):
    """Insert or repair the starter catalogue without creating duplicates."""
    for name, (description, exercises, tips) in CATALOGUE.items():
        category = db.execute(
            "SELECT id FROM workout_categories WHERE name = ?", (name,)
        ).fetchone()
        if category is None:
            cur = db.execute(
                "INSERT INTO workout_categories (name, description) VALUES (?, ?)",
                (name, description),
            )
            category_id = cur.lastrowid
        else:
            category_id = category["id"]

        existing_exercises = {
            row["name"] for row in db.execute(
                "SELECT name FROM exercises WHERE category_id = ?", (category_id,)
            ).fetchall()
        }
        db.executemany(
            "INSERT INTO exercises (category_id, name, description, sets, reps, duration_min) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            [(category_id, *exercise) for exercise in exercises
             if exercise[0] not in existing_exercises],
        )

        existing_tips = {
            row["title"] for row in db.execute(
                "SELECT title FROM nutrition_tips WHERE category_id = ?", (category_id,)
            ).fetchall()
        }
        db.executemany(
            "INSERT INTO nutrition_tips (category_id, title, foods, description) "
            "VALUES (?, ?, ?, ?)",
            [(category_id, *tip) for tip in tips if tip[0] not in existing_tips],
        )
    db.commit()
