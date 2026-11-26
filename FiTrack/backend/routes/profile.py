"""User body information: age, weight, height, calories to burn."""
from flask import Blueprint, g, jsonify

from auth import login_required
from db import get_db
from utils import check_number, error, json_body, row_dict

bp = Blueprint("profile", __name__, url_prefix="/api/profile")

LEVELS = ("beginner", "intermediate", "advanced")


def _bmi(profile):
    if profile and profile["weight_kg"] and profile["height_cm"]:
        m = profile["height_cm"] / 100
        return round(profile["weight_kg"] / (m * m), 1)
    return None


@bp.get("")
@login_required
def get_profile():
    row = get_db().execute(
        "SELECT * FROM profiles WHERE user_id = ?", (g.user["id"],)
    ).fetchone()
    profile = row_dict(row) if row else {}
    profile["bmi"] = _bmi(row)
    return jsonify({"user": dict(g.user), "profile": profile})


@bp.put("")
@login_required
def update_profile():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    db = get_db()
    current = db.execute(
        "SELECT * FROM profiles WHERE user_id = ?", (g.user["id"],)
    ).fetchone()
    errors = {}
    values = {
        "age": data.get("age", current["age"] if current else None),
        "weight_kg": data.get("weight_kg", current["weight_kg"] if current else None),
        "height_cm": data.get("height_cm", current["height_cm"] if current else None),
        "calories_to_burn": data.get(
            "calories_to_burn", current["calories_to_burn"] if current else None
        ),
        "goal_weeks": data.get("goal_weeks", current["goal_weeks"] if current else None),
    }
    age = check_number(values, "age", 10, 100, errors, integer=True)
    weight = check_number(values, "weight_kg", 20, 400, errors)
    height = check_number(values, "height_cm", 80, 250, errors)
    calories = check_number(values, "calories_to_burn", 0, 10000, errors, integer=True)
    goal_weeks = check_number(values, "goal_weeks", 1, 52, errors, integer=True)
    category_id = data.get(
        "goal_category_id", current["goal_category_id"] if current else None
    )
    if category_id is not None and (
        isinstance(category_id, bool)
        or not isinstance(category_id, int)
        or db.execute(
            "SELECT 1 FROM workout_categories WHERE id = ?", (category_id,)
        ).fetchone() is None
    ):
        errors["goal_category_id"] = "Choose a valid workout category id."
    level = data.get("fitness_level", current["fitness_level"] if current else None)
    if level is not None and level not in LEVELS:
        errors["fitness_level"] = f"Must be one of: {', '.join(LEVELS)}."
    if errors:
        return error("Validation failed.", 422, errors)

    db.execute(
        """
        INSERT INTO profiles (
            user_id, age, weight_kg, height_cm, calories_to_burn,
            goal_category_id, goal_weeks, fitness_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            age = excluded.age,
            weight_kg = excluded.weight_kg,
            height_cm = excluded.height_cm,
            calories_to_burn = excluded.calories_to_burn,
            goal_category_id = excluded.goal_category_id,
            goal_weeks = excluded.goal_weeks,
            fitness_level = excluded.fitness_level,
            updated_at = CURRENT_TIMESTAMP
        """,
        (g.user["id"], age, weight, height, calories, category_id, goal_weeks, level),
    )
    db.commit()
    return get_profile.__wrapped__()
