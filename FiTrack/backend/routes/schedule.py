"""Scheduling gym sessions (day + time), with clash detection."""
from datetime import date, time

from flask import Blueprint, g, jsonify, request

from auth import login_required
from db import get_db
from utils import check_number, error, json_body, parse_date, parse_time_minutes, row_dict, rows

bp = Blueprint("schedule", __name__, url_prefix="/api/sessions")

STATUSES = ("scheduled", "completed", "cancelled")

SESSION_SELECT = """
    SELECT s.id, s.category_id, c.name AS workout, s.goal_id, s.session_date,
           s.start_time, s.duration_min, s.notes, s.status
    FROM sessions s JOIN workout_categories c ON c.id = s.category_id
"""


def find_conflict(db, user_id, session_date, start_min, duration, exclude_id=None):
    """Return an existing active session that overlaps the given slot, else None."""
    existing = db.execute(
        "SELECT id, start_time, duration_min FROM sessions "
        "WHERE user_id = %s AND session_date = %s AND status != 'cancelled'",
        (user_id, date.fromisoformat(session_date) if isinstance(session_date, str)
         else session_date),
    ).fetchall()
    for s in existing:
        if exclude_id is not None and s["id"] == exclude_id:
            continue
        s_start = parse_time_minutes(s["start_time"])
        if start_min < s_start + s["duration_min"] and s_start < start_min + duration:
            return s
    return None


def insert_session(db, user_id, category_id, session_date, start_time, duration,
                   notes=None, goal_id=None):
    cur = db.execute(
        "INSERT INTO sessions (user_id, category_id, goal_id, session_date, start_time, "
        "duration_min, notes) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (user_id, category_id, goal_id,
         date.fromisoformat(session_date) if isinstance(session_date, str) else session_date,
         time.fromisoformat(start_time) if isinstance(start_time, str) else start_time,
         duration, notes),
    )
    return cur.fetchone()["id"]


def _validate(data, errors):
    """Shared validation for create/update. Returns cleaned values."""
    d = parse_date(data.get("session_date"))
    if d is None:
        errors["session_date"] = "Use the format YYYY-MM-DD."
    start_min = parse_time_minutes(data.get("start_time"))
    if start_min is None:
        errors["start_time"] = "Use 24-hour format HH:MM."
    duration = check_number(data, "duration_min", 10, 300, errors, integer=True) or 60
    if start_min is not None and "duration_min" not in errors and start_min + duration > 1440:
        errors["duration_min"] = "Session must finish before midnight."
    return d, start_min, duration


@bp.post("")
@login_required
def create_session():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")
    db = get_db()
    errors = {}

    category_id = data.get("category_id")
    if not isinstance(category_id, int) or db.execute(
            "SELECT 1 FROM workout_categories WHERE id = %s", (category_id,)).fetchone() is None:
        errors["category_id"] = "Choose a valid workout category id."
    d, start_min, duration = _validate(data, errors)
    if d is not None and d < date.today():
        errors["session_date"] = "Cannot schedule a session in the past."
    notes = data.get("notes")
    if notes is not None and (not isinstance(notes, str) or len(notes) > 500):
        errors["notes"] = "Notes must be text up to 500 characters."
    if errors:
        return error("Validation failed.", 422, errors)

    if find_conflict(db, g.user["id"], d.isoformat(), start_min, duration):
        return error("You already have a session that overlaps this time.", 409)

    sid = insert_session(db, g.user["id"], category_id, d.isoformat(),
                         data["start_time"], duration, notes)
    db.commit()
    row = db.execute(SESSION_SELECT + " WHERE s.id = %s", (sid,)).fetchone()
    return jsonify({"session": row_dict(row)}), 201


@bp.get("")
@login_required
def list_sessions():
    """Filters: ?from=YYYY-MM-DD&to=YYYY-MM-DD&status=scheduled"""
    sql = SESSION_SELECT + " WHERE s.user_id = %s"
    params = [g.user["id"]]
    for arg, op in (("from", ">="), ("to", "<=")):
        value = request.args.get(arg)
        if value:
            parsed_date = parse_date(value)
            if parsed_date is None:
                return error(f"'{arg}' must be YYYY-MM-DD.", 422)
            sql += f" AND s.session_date {op} %s"
            params.append(parsed_date)
    status = request.args.get("status")
    if status:
        if status not in STATUSES:
            return error(f"status must be one of: {', '.join(STATUSES)}.", 422)
        sql += " AND s.status = %s"
        params.append(status)
    data = get_db().execute(sql + " ORDER BY s.session_date, s.start_time", params).fetchall()
    return jsonify({"sessions": rows(data)})


@bp.get("/timetable")
@login_required
def timetable():
    """Upcoming scheduled sessions grouped by date (for the timetable view)."""
    data = get_db().execute(
        SESSION_SELECT + " WHERE s.user_id = %s AND s.session_date >= %s AND s.status = 'scheduled' "
        "ORDER BY s.session_date, s.start_time",
        (g.user["id"], date.today()),
    ).fetchall()
    grouped = {}
    for r in rows(data):
        grouped.setdefault(r["session_date"], []).append(r)
    return jsonify({"timetable": grouped})


def _own_session(db, session_id):
    return db.execute(
        "SELECT * FROM sessions WHERE id = %s AND user_id = %s", (session_id, g.user["id"])
    ).fetchone()


@bp.get("/<int:session_id>")
@login_required
def get_session(session_id):
    row = get_db().execute(
        SESSION_SELECT + " WHERE s.id = %s AND s.user_id = %s", (session_id, g.user["id"])
    ).fetchone()
    if row is None:
        return error("Session not found.", 404)
    return jsonify({"session": row_dict(row)})


@bp.put("/<int:session_id>")
@login_required
def update_session(session_id):
    """Change date/time/duration/notes/status. Send only the fields to change."""
    db = get_db()
    current = _own_session(db, session_id)
    if current is None:
        return error("Session not found.", 404)
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    merged = {
        "session_date": data.get("session_date", current["session_date"]),
        "start_time": data.get("start_time", current["start_time"]),
        "duration_min": data.get("duration_min", current["duration_min"]),
    }
    errors = {}
    d, start_min, duration = _validate(merged, errors)
    status = data.get("status", current["status"])
    if status not in STATUSES:
        errors["status"] = f"Must be one of: {', '.join(STATUSES)}."
    notes = data.get("notes", current["notes"])
    if notes is not None and (not isinstance(notes, str) or len(notes) > 500):
        errors["notes"] = "Notes must be text up to 500 characters."
    if errors:
        return error("Validation failed.", 422, errors)

    if status != "cancelled" and find_conflict(
            db, g.user["id"], d.isoformat(), start_min, duration, exclude_id=session_id):
        return error("You already have a session that overlaps this time.", 409)

    db.execute(
        "UPDATE sessions SET session_date=%s, start_time=%s, duration_min=%s, notes=%s, status=%s "
        "WHERE id=%s",
        (d, time.fromisoformat(merged["start_time"])
         if isinstance(merged["start_time"], str) else merged["start_time"],
         duration, notes, status, session_id),
    )
    db.commit()
    return get_session.__wrapped__(session_id)


@bp.delete("/<int:session_id>")
@login_required
def delete_session(session_id):
    db = get_db()
    cur = db.execute("DELETE FROM sessions WHERE id = %s AND user_id = %s",
                     (session_id, g.user["id"]))
    db.commit()
    if cur.rowcount == 0:
        return error("Session not found.", 404)
    return jsonify({"message": "Session deleted."})
