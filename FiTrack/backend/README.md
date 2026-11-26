# FiTrack Backend (Flask + SQLite)

REST API for the Gym Workout and Nutrition Management System.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

The API uses SQLite and creates `instance/fitrack.sqlite3` automatically. No
database server setup is required. To use a different file, set `DATABASE_PATH`
before starting the API:

```powershell
$env:DATABASE_PATH = "C:\path\to\fitrack.sqlite3"
python app.py
```

The schema and starter catalogue are initialized automatically on first run;
missing starter rows are repaired at startup. `flask --app app init-db` drops
and recreates all application tables in the configured database file, so it
deletes existing data. PostgreSQL data is not migrated automatically. Run tests
with:

```powershell
pytest
```

Tests use isolated temporary SQLite database files.
The frontend's signup and login screens use the authentication endpoints;
profile, goal preferences, and scheduled sessions are then loaded and saved per
account. Existing browser-only profile and session data is imported at the
account's first login. Contact form submissions are stored in
`contact_messages`.

The Vite frontend proxies `/api` requests to `http://127.0.0.1:5000` during
development. Start the frontend separately with `cd ../frontend && npm run dev`.
For a separately hosted API, set `VITE_API_BASE_URL` to its `/api` URL.

## Project structure

| File | Purpose |
|---|---|
| `app.py` | Creates the app, connects the DB, registers routes, CORS, JSON errors |
| `config.py` | Settings (secret key, SQLite database file, CORS origin) |
| `db.py` | **Database connection** (`get_db()`), `init_db()` |
| `schema.sql` | **Table definitions** |
| `seed_data.py` | Starter workouts, exercises, nutrition tips |
| `auth.py` | Signed login tokens + `@login_required` |
| `utils.py` | Validation + JSON error helpers |
| `routes/*.py` | One file per feature |

## Endpoints

`Auth` = send header `Authorization: Bearer <token>`

| Method | URL | Auth | What it does |
|---|---|---|---|
| POST | /api/auth/register | | Create account, returns token |
| POST | /api/auth/login | | Log in, returns token |
| GET/PUT | /api/profile | yes | Body measurements, calorie target, workout category, and plan duration |
| GET | /api/workouts | yes | All workout categories |
| GET | /api/workouts/<id> | yes | Category + exercises |
| GET/POST | /api/my-workouts | yes | Workouts the user selected |
| DELETE | /api/my-workouts/<category_id> | yes | Unselect |
| GET | /api/nutrition?category_id= | yes | Food/nutrition recommendations |
| POST/GET | /api/sessions | yes | Schedule / list sessions (`?from=&to=&status=`) |
| GET | /api/sessions/timetable | yes | Upcoming sessions grouped by date |
| GET/PUT/DELETE | /api/sessions/<id> | yes | View / change / delete a session |
| POST/GET | /api/goals | yes | Create / list goals with a deadline |
| GET/PUT/DELETE | /api/goals/<id> | yes | View / change status / delete |
| GET | /api/goals/<id>/plan | yes | Week-by-week path to the goal |
| POST | /api/goals/<id>/schedule | yes | Auto-create the plan's sessions |
| GET | /api/dashboard | yes | Everything for the dashboard page |
| DELETE | /api/dashboard | yes | Clear the signed-in user's profile, goals, sessions, and selections |
| POST | /api/contact | | Validated contact form |
| GET | /api/health | | Server check |

## Try it

```bash
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Amina","email":"amina@example.com","password":"password123"}'

curl -X POST localhost:5000/api/goals -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Lose 4kg","category_id":3,"target_calories":12000,"target_weight_kg":76,"end_date":"2026-12-31"}'
```

## Calling it from your JavaScript front end

```js
const API = "http://127.0.0.1:5000/api";

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem("token", data.token);
}

async function getDashboard() {
  const res = await fetch(`${API}/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
}
```

## Before deploying

Set a real `SECRET_KEY` environment variable and set `CORS_ORIGIN` to your site's address.
