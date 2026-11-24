"""PostgreSQL connection helpers.

This file is the single place where the app connects to the database.
Every route calls get_db() to obtain a connection for the current request;
the connection is closed automatically when the request ends.
"""
import psycopg
from psycopg.rows import dict_row

import click
from flask import current_app, g


def get_db():
    """Open (once per request) and return a PostgreSQL connection."""
    if "db" not in g:
        database_url = current_app.config.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError(
                "DATABASE_URL must be set to a PostgreSQL connection string."
            )
        g.db = psycopg.connect(database_url, row_factory=dict_row)
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
    for statement in schema.split(";"):
        statement = statement.strip()
        if statement:
            db.execute(statement)
    seed(db)


def ensure_initialized():
    """Initialize an empty database or repair missing starter catalogue rows."""
    db = get_db()
    tables = {
        row["table_name"] for row in db.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'"
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
