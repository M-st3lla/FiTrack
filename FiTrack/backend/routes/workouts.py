"""Workout categories, exercises, and the workouts a user has selected."""
from flask import Blueprint, g, jsonify

from auth import login_required
from db import get_db
from utils import error, json_body, rows

bp = Blueprint("workouts", __name__, url_prefix="/api")


@bp.get("/workouts")
def list_workouts():
    """Public: all workout categories."""
    data = get_db().execute(
        "SELECT id, name, description FROM workout_categories ORDER BY id"
    ).fetchall()
    return jsonify({"workouts": rows(data)})


@bp.get("/workouts/<int:category_id>")
def get_workout(category_id):
    """Public: one category with its recommended exercises."""
    db = get_db()
    cat = db.execute(
        "SELECT id, name, description FROM workout_categories WHERE id = ?", (category_id,)
    ).fetchone()
    if cat is None:
        return error("Workout category not found.", 404)
    exercises = db.execute(
        "SELECT id, name, description, sets, reps, duration_min "
        "FROM exercises WHERE category_id = ? ORDER BY id",
        (category_id,),
    ).fetchall()
    return jsonify({"workout": {**dict(cat), "exercises": rows(exercises)}})


# --- "Workout Selection": the categories this user picked --------------------

@bp.get("/my-workouts")
@login_required
def my_workouts():
    data = get_db().execute(
        """SELECT c.id, c.name, c.description
           FROM user_workouts uw JOIN workout_categories c ON c.id = uw.category_id
           WHERE uw.user_id = ? ORDER BY uw.created_at""",
        (g.user["id"],),
    ).fetchall()
    return jsonify({"workouts": rows(data)})


@bp.post("/my-workouts")
@login_required
def select_workout():
    data = json_body()
    if data is None or not isinstance(data.get("category_id"), int):
        return error("category_id (integer) is required.", 422)
    db = get_db()
    if db.execute("SELECT 1 FROM workout_categories WHERE id = ?",
                  (data["category_id"],)).fetchone() is None:
        return error("Workout category not found.", 404)
    db.execute(
        "INSERT OR IGNORE INTO user_workouts (user_id, category_id) VALUES (?, ?)",
        (g.user["id"], data["category_id"]),
    )
    db.commit()
    return jsonify({"message": "Workout selected."}), 201


@bp.delete("/my-workouts/<int:category_id>")
@login_required
def unselect_workout(category_id):
    db = get_db()
    cur = db.execute(
        "DELETE FROM user_workouts WHERE user_id = ? AND category_id = ?",
        (g.user["id"], category_id),
    )
    db.commit()
    if cur.rowcount == 0:
        return error("That workout was not selected.", 404)
    return jsonify({"message": "Workout removed."})
