"""Dashboard: one call that returns everything the dashboard page needs."""
from datetime import date

from flask import Blueprint, g, jsonify

from auth import login_required
from db import get_db
from routes.schedule import SESSION_SELECT
from routes.profile import _bmi
from utils import rows

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@bp.get("")
@login_required
def dashboard():
    db = get_db()
    uid = g.user["id"]
    today = date.today().isoformat()

    profile = db.execute("SELECT * FROM profiles WHERE user_id = ?", (uid,)).fetchone()
    selected = db.execute(
        "SELECT c.id, c.name FROM user_workouts uw "
        "JOIN workout_categories c ON c.id = uw.category_id WHERE uw.user_id = ?", (uid,)
    ).fetchall()
    goals = db.execute(
        "SELECT g.id, g.title, c.name AS workout, g.start_date, g.end_date, g.status "
        "FROM goals g JOIN workout_categories c ON c.id = g.category_id "
        "WHERE g.user_id = ? AND g.status = 'active' ORDER BY g.end_date", (uid,)
    ).fetchall()
    upcoming = db.execute(
        SESSION_SELECT + " WHERE s.user_id = ? AND s.session_date >= ? AND s.status = 'scheduled' "
        "ORDER BY s.session_date, s.start_time LIMIT 10", (uid, today)
    ).fetchall()
    stats = db.execute(
        "SELECT "
        " SUM(CASE WHEN status='scheduled' AND session_date >= ? THEN 1 ELSE 0 END) AS upcoming, "
        " SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed, "
        " COALESCE(SUM(CASE WHEN status='completed' THEN duration_min END), 0) AS minutes_trained "
        "FROM sessions WHERE user_id = ?", (today, uid)
    ).fetchone()

    return jsonify({
        "user": dict(g.user),
        "profile": {**(dict(profile) if profile else {}), "bmi": _bmi(profile)},
        "selected_workouts": rows(selected),
        "active_goals": rows(goals),
        "upcoming_sessions": rows(upcoming),
        "stats": {
            "upcoming": stats["upcoming"] or 0,
            "completed": stats["completed"] or 0,
            "minutes_trained": stats["minutes_trained"] or 0,
        },
    })
