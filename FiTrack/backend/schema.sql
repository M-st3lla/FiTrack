-- FiTrack database schema (SQLite).
-- Running this file (via `flask --app app init-db`) drops and recreates every table.

PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS user_workouts;
DROP TABLE IF EXISTS nutrition_tips;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS workout_categories;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;
PRAGMA foreign_keys = ON;

-- Accounts ------------------------------------------------------------------
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Key body information the user enters (objective 7): age, weight, height, calories to burn
CREATE TABLE profiles (
    user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age             INTEGER,
    weight_kg       REAL,
    height_cm       REAL,
    calories_to_burn INTEGER,          -- daily calorie-burn target
    fitness_level   TEXT CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workout catalogue (objectives 1-3) ------------------------------------------
CREATE TABLE workout_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE exercises (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id  INTEGER NOT NULL REFERENCES workout_categories(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT,
    sets         INTEGER,
    reps         INTEGER,
    duration_min INTEGER
);

CREATE TABLE nutrition_tips (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES workout_categories(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    foods       TEXT NOT NULL,          -- comma separated list of recommended foods
    description TEXT NOT NULL
);

-- Workouts a user has selected ("Workout Selection")
CREATE TABLE user_workouts (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES workout_categories(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);

-- Goals with a deadline (objective 8, "Prompting of required goals") ----------
CREATE TABLE goals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES workout_categories(id),
    title           TEXT NOT NULL,
    target_calories INTEGER,            -- total calories to burn over the whole period
    target_weight_kg REAL,
    start_date      TEXT NOT NULL,      -- ISO date YYYY-MM-DD
    end_date        TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','completed','abandoned')),
    created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled gym sessions (objectives 4-5) -------------------------------------
CREATE TABLE sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  INTEGER NOT NULL REFERENCES workout_categories(id),
    goal_id      INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    session_date TEXT NOT NULL,         -- ISO date YYYY-MM-DD
    start_time   TEXT NOT NULL,         -- HH:MM (24h)
    duration_min INTEGER NOT NULL DEFAULT 60,
    notes        TEXT,
    status       TEXT NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled','completed','cancelled')),
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, session_date);

-- Contact form (validated) ----------------------------------------------------
CREATE TABLE contact_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
