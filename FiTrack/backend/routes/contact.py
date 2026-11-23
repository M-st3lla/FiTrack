"""Validated contact / feedback form."""
from flask import Blueprint, jsonify

from db import get_db
from utils import EMAIL_RE, error, json_body

bp = Blueprint("contact", __name__, url_prefix="/api/contact")


@bp.post("")
def submit_contact():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    subject = str(data.get("subject", "")).strip()
    message = str(data.get("message", "")).strip()

    errors = {}
    if len(name) < 2:
        errors["name"] = "Name must be at least 2 characters."
    if not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    if len(subject) > 150:
        errors["subject"] = "Subject must be 150 characters or fewer."
    if not (10 <= len(message) <= 2000):
        errors["message"] = "Message must be between 10 and 2000 characters."
    if errors:
        return error("Validation failed.", 422, errors)

    db = get_db()
    db.execute(
        "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
        (name, email, subject or None, message),
    )
    db.commit()
    return jsonify({"message": "Thanks! Your message has been received."}), 201
