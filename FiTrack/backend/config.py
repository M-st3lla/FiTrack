"""Central configuration. Values can be overridden with environment variables."""
import os


class Config:
    # Used to sign login tokens. CHANGE THIS in production (set the SECRET_KEY env var).
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # SQLite database file. Override with DATABASE_PATH when deploying.
    DATABASE_PATH = os.environ.get(
        "DATABASE_PATH",
        os.path.join(os.path.dirname(__file__), "instance", "fitrack.sqlite3"),
    )

    # How long a login token stays valid (seconds). Default: 7 days.
    TOKEN_MAX_AGE = int(os.environ.get("TOKEN_MAX_AGE", 60 * 60 * 24 * 7))

    # Which front-end origin may call the API (CORS). "*" = any (fine for development).
    CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
