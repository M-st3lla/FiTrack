"""Goals over a time period, the generated plan, and auto-scheduling of that plan."""
import math
from datetime import date, timedelta

from flask import Blueprint, g, jsonify

from auth import login_required
from db import get_db
from routes.schedule import find_conflict, insert_session
from utils import check_number, error, json_body, parse_date, parse_time_minutes, rows

bp = Blueprint("goals", __name__, url_prefix="/api/goals")

STATUSES = ("active", "completed", "abandoned")
MAX_PERIOD_DAYS = 365

# Weekdays used for a given number of sessions per week (Mon=0 ... Sun=6)
PATTERNS = {1: [2], 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5]}
SESSIONS_BY_LEVEL = {"beginner": 3, "intermediate": 4, "advanced": 5}


def _own_goal(db, goal_id):
    return db.execute(
        "SELECT g.*, c.name AS workout FROM goals g "
        "JOIN workout_categories c ON c.id = g.category_id "
        "WHERE g.id = ? AND g.user_id = ?", (goal_id, g.user["id"])
    ).fetchone()


@bp.post("")
@login_required
def create_goal():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")
    db = get_db()
    errors = {}

    title = str(data.get("title", "")).strip()
    if len(title) < 3:
        errors["title"] = "Title must be at least 3 characters."
    category_id = data.get("category_id")
    if not isinstance(category_id, int) or db.execute(
            "SELECT 1 FROM workout_categories WHERE id = ?", (category_id,)).fetchone() is None:
        errors["category_id"] = "Choose a valid workout category id."
    target_cal = check_number(data, "target_calories", 1, 1_000_000, errors, integer=True)
    target_weight = check_number(data, "target_weight_kg", 20, 400, errors)

    start = parse_date(data.get("start_date")) if data.get("start_date") else date.today()
    end = parse_date(data.get("end_date"))
    if start is None:
        errors["start_date"] = "Use the format YYYY-MM-DD."
    if end is None:
        errors["end_date"] = "Use the format YYYY-MM-DD."
    if start and end:
        if end < start:
            errors["end_date"] = "End date must be on or after the start date."
        elif (end - start).days + 1 > MAX_PERIOD_DAYS:
            errors["end_date"] = f"Goal period cannot exceed {MAX_PERIOD_DAYS} days."
    if errors:
        return error("Validation failed.", 422, errors)

    cur = db.execute(
        "INSERT INTO goals (user_id, category_id, title, target_calories, target_weight_kg, "
        "start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (g.user["id"], category_id, title, target_cal, target_weight,
         start.isoformat(), end.isoformat()),
    )
    db.commit()
    return jsonify({"goal": dict(_own_goal(db, cur.lastrowid))}), 201


@bp.get("")
@login_required
def list_goals():
    data = get_db().execute(
        "SELECT g.*, c.name AS workout FROM goals g "
        "JOIN workout_categories c ON c.id = g.category_id "
        "WHERE g.user_id = ? ORDER BY g.end_date", (g.user["id"],)
    ).fetchall()
    return jsonify({"goals": rows(data)})


@bp.get("/<int:goal_id>")
@login_required
def get_goal(goal_id):
    goal = _own_goal(get_db(), goal_id)
    if goal is None:
        return error("Goal not found.", 404)
    return jsonify({"goal": dict(goal)})


@bp.put("/<int:goal_id>")
@login_required
def update_goal_status(goal_id):
    db = get_db()
    if _own_goal(db, goal_id) is None:
        return error("Goal not found.", 404)
    data = json_body()
    if data is None or data.get("status") not in STATUSES:
        return error(f"status must be one of: {', '.join(STATUSES)}.", 422)
    db.execute("UPDATE goals SET status = ? WHERE id = ?", (data["status"], goal_id))
    db.commit()
    return jsonify({"goal": dict(_own_goal(db, goal_id))})


@bp.delete("/<int:goal_id>")
@login_required
def delete_goal(goal_id):
    db = get_db()
    cur = db.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, g.user["id"]))
    db.commit()
    if cur.rowcount == 0:
        return error("Goal not found.", 404)
    return jsonify({"message": "Goal deleted."})


# --- The "quick and clear path to achieve the goal" ---------------------------

def _planned_days(goal, sessions_per_week):
    start = date.fromisoformat(goal["start_date"])
    end = date.fromisoformat(goal["end_date"])
    pattern = PATTERNS[sessions_per_week]
    days = []
    for i in range((end - start).days + 1):
        d = start + timedelta(days=i)
        if d.weekday() in pattern:
            days.append({"date": d.isoformat(), "weekday": d.strftime("%A"), "week": i // 7 + 1})
    return days


def _sessions_per_week(db, requested):
    if requested in PATTERNS:
        return requested
    profile = db.execute(
        "SELECT fitness_level FROM profiles WHERE user_id = ?", (g.user["id"],)
    ).fetchone()
    level = profile["fitness_level"] if profile else None
    return SESSIONS_BY_LEVEL.get(level, 3)


@bp.get("/<int:goal_id>/plan")
@login_required
def goal_plan(goal_id):
    """Build a week-by-week plan from the goal's period, the user's level and profile."""
    db = get_db()
    goal = _own_goal(db, goal_id)
    if goal is None:
        return error("Goal not found.", 404)

    from flask import request
    requested = request.args.get("sessions_per_week", type=int)
    spw = _sessions_per_week(db, requested)

    start = date.fromisoformat(goal["start_date"])
    end = date.fromisoformat(goal["end_date"])
    total_days = (end - start).days + 1
    weeks = max(1, math.ceil(total_days / 7))

    exercises = rows(db.execute(
        "SELECT name, sets, reps, duration_min FROM exercises WHERE category_id = ? ORDER BY id",
        (goal["category_id"],)).fetchall())
    tips = rows(db.execute(
        "SELECT title, foods, description FROM nutrition_tips WHERE category_id = ? ORDER BY id",
        (goal["category_id"],)).fetchall())
    for t in tips:
        t["foods"] = [f.strip() for f in t["foods"].split(",")]

    days = _planned_days(goal, spw)
    by_week = {}
    for k, day in enumerate(days):
        # rotate through the exercise list so sessions vary
        focus = [exercises[(k * 3 + j) % len(exercises)] for j in range(min(4, len(exercises)))]
        by_week.setdefault(day["week"], []).append({**day, "exercises": focus})

    summary = {
        "period_days": total_days,
        "weeks": weeks,
        "sessions_per_week": spw,
        "total_sessions": len(days),
    }
    if goal["target_calories"] and days:
        summary["calories_per_week"] = round(goal["target_calories"] / weeks)
        summary["calories_per_session"] = round(goal["target_calories"] / len(days))

    notes = []
    profile = db.execute("SELECT * FROM profiles WHERE user_id = ?", (g.user["id"],)).fetchone()
    if goal["target_weight_kg"] and profile and profile["weight_kg"]:
        change = goal["target_weight_kg"] - profile["weight_kg"]
        per_week = change / weeks
        summary["weight_change_kg"] = round(change, 1)
        summary["weight_change_per_week_kg"] = round(per_week, 2)
        if abs(per_week) > 1:
            notes.append("This target is more than 1 kg per week, which is aggressive. "
                         "Consider a longer period.")
    elif goal["target_weight_kg"]:
        notes.append("Add your current weight to your profile to see weekly weight change.")

    return jsonify({
        "goal": dict(goal),
        "summary": summary,
        "notes": notes,
        "weeks": [{"week": w, "sessions": s} for w, s in sorted(by_week.items())],
        "nutrition": tips,
    })


@bp.post("/<int:goal_id>/schedule")
@login_required
def schedule_goal(goal_id):
    """Turn the plan into real scheduled sessions.

    Body (all optional): {"start_time": "18:00", "duration_min": 60, "sessions_per_week": 3}
    Past dates and clashing slots are skipped and reported back.
    """
    db = get_db()
    goal = _own_goal(db, goal_id)
    if goal is None:
        return error("Goal not found.", 404)
    data = json_body() or {}

    errors = {}
    start_time = data.get("start_time", "18:00")
    start_min = parse_time_minutes(start_time)
    if start_min is None:
        errors["start_time"] = "Use 24-hour format HH:MM."
    duration = check_number(data, "duration_min", 10, 300, errors, integer=True) or 60
    if start_min is not None and start_min + duration > 1440:
        errors["duration_min"] = "Session must finish before midnight."
    if errors:
        return error("Validation failed.", 422, errors)

    spw = _sessions_per_week(db, data.get("sessions_per_week"))
    today = date.today().isoformat()
    created, skipped = [], []
    for day in _planned_days(goal, spw):
        if day["date"] < today:
            skipped.append({"date": day["date"], "reason": "in the past"})
        elif find_conflict(db, g.user["id"], day["date"], start_min, duration):
            skipped.append({"date": day["date"], "reason": "clashes with another session"})
        else:
            insert_session(db, g.user["id"], goal["category_id"], day["date"],
                           start_time, duration, notes=f"Goal: {goal['title']}",
                           goal_id=goal_id)
            created.append(day["date"])
    db.commit()
    return jsonify({"created": len(created), "dates": created, "skipped": skipped}), 201
