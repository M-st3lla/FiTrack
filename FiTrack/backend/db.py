"""SQLite connection helpers.

This file is the single place where the app connects to the database.
Every route calls get_db() to obtain a connection for the current request;
the connection is closed automatically when the request ends.
"""
import os
import sqlite3

import click
from flask import current_app, g


def get_db():
    """Open (once per request) and return a SQLite connection."""
    if "db" not in g:
        database_path = current_app.config["DATABASE_PATH"]
        os.makedirs(os.path.dirname(os.path.abspath(database_path)), exist_ok=True)
        g.db = sqlite3.connect(database_path)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Create all tables from schema.sql and load the starter catalogue."""
    from seed_data import seed

    db = get_db()
    with current_app.open_resource("schema.sql") as f:
        schema = f.read().decode("utf-8")
    db.executescript(schema)
    seed(db)


def ensure_initialized():
    """Initialize an empty database or repair missing starter catalogue rows."""
    db = get_db()
    tables = {
        row["name"]
        for row in db.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' "
            "AND name NOT LIKE 'sqlite_%'"
        ).fetchall()
    }
    if not tables:
        init_db()
        return
    if "workout_categories" not in tables:
        raise RuntimeError(
            "The database has tables but no workout catalogue schema; "
            "run 'flask --app app init-db' to recreate it."
        )

    profile_columns = {
        row["name"] for row in db.execute("PRAGMA table_info(profiles)").fetchall()
    }
    if "goal_category_id" not in profile_columns:
        db.execute(
            "ALTER TABLE profiles ADD COLUMN goal_category_id INTEGER "
            "REFERENCES workout_categories(id) ON DELETE SET NULL"
        )
    if "goal_weeks" not in profile_columns:
        db.execute(
            "ALTER TABLE profiles ADD COLUMN goal_weeks INTEGER "
            "CHECK (goal_weeks IS NULL OR goal_weeks BETWEEN 1 AND 52)"
        )
    db.commit()

    from seed_data import seed

    seed(db)


@click.command("init-db")
def init_db_command():
    """Drop and recreate all tables, then load starter data."""
    init_db()
    click.echo("Database initialised.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
