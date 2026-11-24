"""Central configuration. Values can be overridden with environment variables."""
import os


class Config:
    # Used to sign login tokens. CHANGE THIS in production (set the SECRET_KEY env var).
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # PostgreSQL connection string, e.g. postgresql://user:password@localhost/fitrack
    DATABASE_URL = os.environ.get("DATABASE_URL")

    # How long a login token stays valid (seconds). Default: 7 days.
    TOKEN_MAX_AGE = int(os.environ.get("TOKEN_MAX_AGE", 60 * 60 * 24 * 7))

    # Which front-end origin may call the API (CORS). "*" = any (fine for development).
    CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
