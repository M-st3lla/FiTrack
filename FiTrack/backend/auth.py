"""Login tokens and the @login_required decorator.

On login the server hands back a signed token. The front end sends it on every
protected request as:   Authorization: Bearer <token>
"""
from functools import wraps

from flask import current_app, g, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from db import get_db
from utils import error


def _serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="fitrack-auth")


def make_token(user_id):
    return _serializer().dumps({"uid": user_id})


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return error("Missing or malformed Authorization header.", 401)
        try:
            data = _serializer().loads(
                header[7:], max_age=current_app.config["TOKEN_MAX_AGE"]
            )
        except SignatureExpired:
            return error("Token expired. Please log in again.", 401)
        except BadSignature:
            return error("Invalid token.", 401)

        user = get_db().execute(
            "SELECT id, name, email FROM users WHERE id = ?", (data["uid"],)
        ).fetchone()
        if user is None:
            return error("User no longer exists.", 401)
        g.user = user
        return view(*args, **kwargs)

    return wrapped
