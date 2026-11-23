"""Database connection helpers.

This file is the single place where the app connects to the database.
Every route calls get_db() to obtain a connection for the current request;
the connection is closed automatically when the request ends.
"""
import sqlite3

import click
from flask import current_app, g


def get_db():
    """Open (once per request) and return a connection to the SQLite file."""
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row          # rows behave like dicts: row["name"]
        g.db.execute("PRAGMA foreign_keys = ON")  # SQLite needs this to enforce FKs
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
        db.executescript(f.read().decode("utf-8"))
    seed(db)


@click.command("init-db")
def init_db_command():
    """Drop and recreate all tables, then load starter data."""
    init_db()
    click.echo("Database initialised.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
