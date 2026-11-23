"""User body information: age, weight, height, calories to burn."""
from flask import Blueprint, g, jsonify

from auth import login_required
from db import get_db
from utils import check_number, error, json_body

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
    profile = dict(row) if row else {}
    profile["bmi"] = _bmi(row)
    return jsonify({"user": dict(g.user), "profile": profile})


@bp.put("")
@login_required
def update_profile():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    errors = {}
    age = check_number(data, "age", 10, 100, errors, integer=True)
    weight = check_number(data, "weight_kg", 20, 400, errors)
    height = check_number(data, "height_cm", 80, 250, errors)
    calories = check_number(data, "calories_to_burn", 0, 10000, errors, integer=True)
    level = data.get("fitness_level")
    if level is not None and level not in LEVELS:
        errors["fitness_level"] = f"Must be one of: {', '.join(LEVELS)}."
    if errors:
        return error("Validation failed.", 422, errors)

    db = get_db()
    # Upsert: insert the row, or update it if this user already has one
    db.execute(
        """
        INSERT INTO profiles (user_id, age, weight_kg, height_cm, calories_to_burn, fitness_level)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            age = excluded.age,
            weight_kg = excluded.weight_kg,
            height_cm = excluded.height_cm,
            calories_to_burn = excluded.calories_to_burn,
            fitness_level = excluded.fitness_level,
            updated_at = CURRENT_TIMESTAMP
        """,
        (g.user["id"], age, weight, height, calories, level),
    )
    db.commit()
    return get_profile.__wrapped__()
