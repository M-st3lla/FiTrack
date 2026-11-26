"""Small helpers shared by all routes: JSON errors and input validation."""
import re
from datetime import date, datetime, time

from flask import jsonify, request

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def error(message, status=400, details=None):
    body = {"error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def json_body():
    """Return the request JSON as a dict, or None if missing/invalid."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def rows(cursor_rows):
    return [row_dict(r) for r in cursor_rows]


def row_dict(row):
    """Convert a SQLite row to JSON-friendly values."""
    result = dict(row)
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, date):
            result[key] = value.isoformat()
        elif isinstance(value, time):
            result[key] = value.isoformat(timespec="minutes")
    return result


def parse_date(value):
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(value)
    except (ValueError, TypeError):
        return None


def parse_time_minutes(value):
    """'18:30' -> 1110 (minutes since midnight), or None if invalid."""
    if isinstance(value, time):
        return value.hour * 60 + value.minute
    try:
        t = datetime.strptime(value, "%H:%M")
        return t.hour * 60 + t.minute
    except (ValueError, TypeError):
        return None


def check_number(data, key, lo, hi, errors, integer=False, required=False):
    """Validate an optional/required numeric field. Adds to `errors` on failure."""
    value = data.get(key)
    if value is None or value == "":
        if required:
            errors[key] = "This field is required."
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        errors[key] = "Must be a number."
        return None
    if integer and int(value) != value:
        errors[key] = "Must be a whole number."
        return None
    if not (lo <= value <= hi):
        errors[key] = f"Must be between {lo} and {hi}."
        return None
    return int(value) if integer else float(value)
