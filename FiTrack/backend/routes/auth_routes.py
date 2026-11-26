"""Register and log in."""
import sqlite3

from flask import Blueprint, jsonify  # type: ignore[import-unresolved]
from werkzeug.security import check_password_hash, generate_password_hash  # type: ignore[import-unresolved]

from auth import make_token
from db import get_db
from utils import EMAIL_RE, error, json_body

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    errors = {}
    if len(name) < 2:
        errors["name"] = "Name must be at least 2 characters."
    if not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    if len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."

    goal_category = data.get("goal_category")
    category_id = None
    if goal_category is not None:
        if not isinstance(goal_category, str):
            errors["goal_category"] = "Choose a valid workout category."
        else:
            category = get_db().execute(
                "SELECT id FROM workout_categories WHERE name = ?", (goal_category,)
            ).fetchone()
            if category is None:
                errors["goal_category"] = "Choose a valid workout category."
            else:
                category_id = category["id"]
    if errors:
        return error("Validation failed.", 422, errors)

    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password)),
        )
        user_id = cur.lastrowid
        if category_id is not None:
            db.execute(
                "INSERT INTO profiles (user_id, goal_category_id) VALUES (?, ?)",
                (user_id, category_id),
            )
        db.commit()
    except sqlite3.IntegrityError as exc:
        db.rollback()
        if "users.email" in str(exc):
            return error("An account with that email already exists.", 409)
        raise

    user = {"id": user_id, "name": name, "email": email}
    return jsonify({"user": user, "token": make_token(user["id"])}), 201


@bp.post("/login")
def login():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    row = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row is None or not check_password_hash(row["password_hash"], password):
        return error("Incorrect email or password.", 401)

    user = {"id": row["id"], "name": row["name"], "email": row["email"]}
    return jsonify({"user": user, "token": make_token(row["id"])})
