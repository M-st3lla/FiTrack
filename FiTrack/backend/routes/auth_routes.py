"""Register and log in."""
from psycopg.errors import UniqueViolation

from flask import Blueprint, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

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
    if errors:
        return error("Validation failed.", 422, errors)

    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (name, email, generate_password_hash(password)),
        )
        db.commit()
    except UniqueViolation:
        db.rollback()
        return error("An account with that email already exists.", 409)

    user = {"id": cur.fetchone()["id"], "name": name, "email": email}
    return jsonify({"user": user, "token": make_token(user["id"])}), 201


@bp.post("/login")
def login():
    data = json_body()
    if data is None:
        return error("Request body must be JSON.")

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    row = get_db().execute("SELECT * FROM users WHERE email = %s", (email,)).fetchone()
    if row is None or not check_password_hash(row["password_hash"], password):
        return error("Incorrect email or password.", 401)

    user = {"id": row["id"], "name": row["name"], "email": row["email"]}
    return jsonify({"user": user, "token": make_token(row["id"])})
