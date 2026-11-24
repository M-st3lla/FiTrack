# FiTrack Backend (Flask + PostgreSQL)

REST API for the Gym Workout and Nutrition Management System.

## Setup

```bash
cd fitrack-backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a PostgreSQL database named `fitrack`, then set the connection string
before starting the API:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/fitrack"
python app.py
```

The schema and starter catalogue are initialized automatically on first run;
missing starter rows are repaired at startup. `flask --app app init-db` drops
and recreates all application tables in the configured database schema, so it
deletes existing data. Run tests against a PostgreSQL database with:

```powershell
$env:TEST_DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/fitrack_test"
pytest
```

Tests create and remove a uniquely named temporary schema in that database.

The Vite frontend proxies `/api` requests to `http://127.0.0.1:5000` during
development. Start the frontend separately with `cd ../frontend && npm run dev`.
For a separately hosted API, set `VITE_API_BASE_URL` to its `/api` URL.

## Project structure

| File | Purpose |
|---|---|
| `app.py` | Creates the app, connects the DB, registers routes, CORS, JSON errors |
| `config.py` | Settings (secret key, PostgreSQL connection string, CORS origin) |
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
| GET/PUT | /api/profile | yes | Age, weight_kg, height_cm, calories_to_burn, fitness_level |
| GET | /api/workouts | | All workout categories |
| GET | /api/workouts/<id> | | Category + exercises |
| GET/POST | /api/my-workouts | yes | Workouts the user selected |
| DELETE | /api/my-workouts/<category_id> | yes | Unselect |
| GET | /api/nutrition?category_id= | | Food/nutrition recommendations |
| POST/GET | /api/sessions | yes | Schedule / list sessions (`?from=&to=&status=`) |
| GET | /api/sessions/timetable | yes | Upcoming sessions grouped by date |
| GET/PUT/DELETE | /api/sessions/<id> | yes | View / change / delete a session |
| POST/GET | /api/goals | yes | Create / list goals with a deadline |
| GET/PUT/DELETE | /api/goals/<id> | yes | View / change status / delete |
| GET | /api/goals/<id>/plan | yes | Week-by-week path to the goal |
| POST | /api/goals/<id>/schedule | yes | Auto-create the plan's sessions |
| GET | /api/dashboard | yes | Everything for the dashboard page |
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
