import os
import sys
from datetime import date, timedelta

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app import create_app  # noqa: E402


@pytest.fixture()
def client(tmp_path):
    app = create_app({
        "TESTING": True,
        "DATABASE_PATH": str(tmp_path / "fitrack_test.sqlite3"),
    })
    yield app.test_client()


@pytest.fixture()
def auth(client):
    r = client.post("/api/auth/register",
                    json={"name": "Amina", "email": "Amina@Example.com", "password": "secret123"})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.get_json()['token']}"}


def future(days):
    return (date.today() + timedelta(days=days)).isoformat()


def test_health_and_seeded_catalogue(client, auth):
    assert client.get("/").get_json() == {
        "service": "FiTrack API",
        "status": "ok",
        "health": "/api/health",
        "frontend": "http://127.0.0.1:5173",
    }
    assert client.get("/api/health").get_json() == {"status": "ok"}
    workouts = client.get("/api/workouts", headers=auth).get_json()["workouts"]
    assert len(workouts) == 5
    detail = client.get(
        f"/api/workouts/{workouts[0]['id']}", headers=auth
    ).get_json()["workout"]
    assert len(detail["exercises"]) >= 5
    tips = client.get(
        "/api/nutrition?category_id=1", headers=auth
    ).get_json()["nutrition"]
    assert tips and isinstance(tips[0]["foods"], list)
    assert client.get("/api/workouts/999", headers=auth).status_code == 404


def test_workouts_and_nutrition_require_authentication(client):
    for endpoint in ("/api/workouts", "/api/workouts/1", "/api/nutrition"):
        assert client.get(endpoint).status_code == 401


def test_seed_is_idempotent_and_repairs_missing_rows(client):
    from db import get_db
    from seed_data import seed

    with client.application.app_context():
        database = get_db()
        seed(database)
        assert database.execute(
            "SELECT COUNT(*) AS count FROM workout_categories"
        ).fetchone()["count"] == 5
        assert database.execute(
            "SELECT COUNT(*) AS count FROM exercises"
        ).fetchone()["count"] == 25
        assert database.execute(
            "SELECT COUNT(*) AS count FROM nutrition_tips"
        ).fetchone()["count"] == 15

        database.execute(
            "DELETE FROM exercises WHERE category_id = ? AND name = ?", (1, "Deadlift")
        )
        seed(database)
        assert database.execute(
            "SELECT COUNT(*) AS count FROM exercises WHERE category_id = ?", (1,)
        ).fetchone()["count"] == 5


def test_register_login_and_auth_rules(client, auth):
    dup = client.post("/api/auth/register",
                      json={"name": "X Y", "email": "amina@example.com", "password": "secret123"})
    assert dup.status_code == 409
    bad = client.post("/api/auth/register", json={"name": "A", "email": "nope", "password": "1"})
    assert bad.status_code == 422 and set(bad.get_json()["details"]) == {"name", "email", "password"}
    assert client.post("/api/auth/login",
                       json={"email": "amina@example.com", "password": "wrong"}).status_code == 401
    ok = client.post("/api/auth/login", json={"email": "amina@example.com", "password": "secret123"})
    assert ok.status_code == 200 and "token" in ok.get_json()
    assert client.get("/api/profile").status_code == 401
    assert client.get("/api/profile", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_register_persists_selected_goal(client):
    response = client.post("/api/auth/register", json={
        "name": "Goal User", "email": "goal@example.com", "password": "secret123",
        "goal_category": "Strength Training",
    })
    assert response.status_code == 201
    headers = {"Authorization": f"Bearer {response.get_json()['token']}"}
    assert client.get("/api/profile", headers=headers).get_json()["profile"][
        "goal_category_id"
    ] == 1


def test_profile(client, auth):
    r = client.put("/api/profile", headers=auth, json={
        "age": 25, "weight_kg": 70, "height_cm": 175, "calories_to_burn": 500,
        "fitness_level": "beginner", "goal_category_id": 1, "goal_weeks": 8})
    assert r.status_code == 200
    assert r.get_json()["profile"]["bmi"] == 22.9
    # update again (upsert path)
    client.put("/api/profile", headers=auth, json={"age": 26, "weight_kg": 69})
    profile = client.get("/api/profile", headers=auth).get_json()["profile"]
    assert profile["age"] == 26
    assert profile["height_cm"] == 175
    assert profile["goal_category_id"] == 1
    assert profile["goal_weeks"] == 8
    bad = client.put("/api/profile", headers=auth, json={"age": 3, "fitness_level": "pro"})
    assert bad.status_code == 422


def test_reset_dashboard_clears_user_data(client, auth):
    client.put("/api/profile", headers=auth, json={"age": 30, "goal_category_id": 1})
    client.post("/api/my-workouts", headers=auth, json={"category_id": 1})
    client.post("/api/sessions", headers=auth, json={
        "category_id": 1, "session_date": future(1), "start_time": "10:00"})

    assert client.delete("/api/dashboard", headers=auth).status_code == 200
    assert "age" not in client.get("/api/profile", headers=auth).get_json()["profile"]
    assert client.get("/api/sessions", headers=auth).get_json()["sessions"] == []
    assert client.get("/api/my-workouts", headers=auth).get_json()["workouts"] == []


def test_selected_workouts(client, auth):
    assert client.post("/api/my-workouts", headers=auth, json={"category_id": 2}).status_code == 201
    client.post("/api/my-workouts", headers=auth, json={"category_id": 2})  # idempotent
    assert len(client.get("/api/my-workouts", headers=auth).get_json()["workouts"]) == 1
    assert client.post("/api/my-workouts", headers=auth, json={"category_id": 99}).status_code == 404
    assert client.delete("/api/my-workouts/2", headers=auth).status_code == 200
    assert client.delete("/api/my-workouts/2", headers=auth).status_code == 404


def test_sessions_crud_and_conflicts(client, auth):
    body = {"category_id": 1, "session_date": future(2), "start_time": "18:00", "duration_min": 60}
    r = client.post("/api/sessions", headers=auth, json=body)
    assert r.status_code == 201
    assert r.get_json()["session"]["session_date"] == future(2)
    assert r.get_json()["session"]["start_time"] == "18:00"
    sid = r.get_json()["session"]["id"]

    clash = client.post("/api/sessions", headers=auth, json={**body, "start_time": "18:30"})
    assert clash.status_code == 409
    adjacent = client.post(
        "/api/sessions",
        headers=auth,
        json={**body, "category_id": 2, "start_time": "19:00"},
    )
    assert adjacent.status_code == 201

    past = client.post("/api/sessions", headers=auth, json={**body, "session_date": future(-1)})
    assert past.status_code == 422
    badtime = client.post("/api/sessions", headers=auth, json={**body, "start_time": "25:99"})
    assert badtime.status_code == 422

    upd = client.put(f"/api/sessions/{sid}", headers=auth, json={"status": "completed"})
    assert upd.get_json()["session"]["status"] == "completed"
    assert len(client.get("/api/sessions?status=scheduled", headers=auth).get_json()["sessions"]) == 1
    assert future(2) in client.get("/api/sessions/timetable", headers=auth).get_json()["timetable"]
    assert client.delete(f"/api/sessions/{sid}", headers=auth).status_code == 200
    assert client.get(f"/api/sessions/{sid}", headers=auth).status_code == 404


def test_session_conflicts_respect_workout_duration(client, auth):
    date = future(3)
    body = {
        "category_id": 1,
        "session_date": date,
        "start_time": "18:00",
        "duration_min": 40,
    }

    assert client.post("/api/sessions", headers=auth, json=body).status_code == 201
    overlap = client.post(
        "/api/sessions",
        headers=auth,
        json={**body, "start_time": "18:39", "duration_min": 20},
    )
    adjacent = client.post(
        "/api/sessions",
        headers=auth,
        json={**body, "category_id": 2, "start_time": "18:40", "duration_min": 20},
    )

    assert overlap.status_code == 409
    assert adjacent.status_code == 201


def test_same_workout_cannot_be_scheduled_back_to_back(client, auth):
    date = future(4)
    first = {
        "category_id": 1,
        "session_date": date,
        "start_time": "18:00",
        "duration_min": 60,
    }

    assert client.post("/api/sessions", headers=auth, json=first).status_code == 201

    same_workout_before = client.post(
        "/api/sessions",
        headers=auth,
        json={**first, "start_time": "17:15", "duration_min": 45},
    )
    same_workout_after = client.post(
        "/api/sessions",
        headers=auth,
        json={**first, "start_time": "19:00", "duration_min": 45},
    )
    same_workout_with_gap = client.post(
        "/api/sessions",
        headers=auth,
        json={**first, "start_time": "19:15", "duration_min": 45},
    )
    update_same_workout_back_to_back = client.put(
        f"/api/sessions/{same_workout_with_gap.get_json()['session']['id']}",
        headers=auth,
        json={"start_time": "19:00"},
    )
    different_workout_after = client.post(
        "/api/sessions",
        headers=auth,
        json={**first, "category_id": 2, "start_time": "19:00", "duration_min": 15},
    )

    assert same_workout_before.status_code == 409
    assert same_workout_after.status_code == 409
    assert same_workout_with_gap.status_code == 201
    assert update_same_workout_back_to_back.status_code == 409
    assert different_workout_after.status_code == 201


def test_users_cannot_see_each_others_data(client, auth):
    r = client.post("/api/sessions", headers=auth, json={
        "category_id": 1, "session_date": future(1), "start_time": "10:00"})
    sid = r.get_json()["session"]["id"]
    other = client.post("/api/auth/register",
                        json={"name": "Bob B", "email": "bob@example.com", "password": "secret123"})
    h2 = {"Authorization": f"Bearer {other.get_json()['token']}"}
    assert client.get(f"/api/sessions/{sid}", headers=h2).status_code == 404
    assert client.delete(f"/api/sessions/{sid}", headers=h2).status_code == 404
    assert client.get("/api/sessions", headers=h2).get_json()["sessions"] == []


def test_goal_plan_and_autoschedule(client, auth):
    client.put("/api/profile", headers=auth, json={
        "weight_kg": 80, "height_cm": 180, "fitness_level": "intermediate"})
    g = client.post("/api/goals", headers=auth, json={
        "title": "Lose 4kg", "category_id": 3, "target_calories": 12000,
        "target_weight_kg": 76, "start_date": future(0), "end_date": future(27)})
    assert g.status_code == 201
    gid = g.get_json()["goal"]["id"]

    plan = client.get(f"/api/goals/{gid}/plan", headers=auth).get_json()
    assert plan["summary"]["weeks"] == 4
    assert plan["summary"]["sessions_per_week"] == 4
    assert plan["summary"]["total_sessions"] == 16
    assert plan["summary"]["calories_per_week"] == 3000
    assert plan["summary"]["weight_change_per_week_kg"] == -1.0
    assert plan["nutrition"] and plan["weeks"][0]["sessions"][0]["exercises"]

    sched = client.post(f"/api/goals/{gid}/schedule", headers=auth,
                        json={"start_time": "07:00", "duration_min": 45})
    assert sched.status_code == 201 and sched.get_json()["created"] == 16
    again = client.post(f"/api/goals/{gid}/schedule", headers=auth, json={"start_time": "07:00"})
    assert again.get_json()["created"] == 0 and len(again.get_json()["skipped"]) == 16

    dash = client.get("/api/dashboard", headers=auth).get_json()
    assert dash["stats"]["upcoming"] == 16
    assert dash["active_goals"][0]["title"] == "Lose 4kg"

    assert client.put(f"/api/goals/{gid}", headers=auth, json={"status": "completed"}).status_code == 200
    assert client.get("/api/dashboard", headers=auth).get_json()["active_goals"] == []


def test_goal_validation(client, auth):
    r = client.post("/api/goals", headers=auth, json={
        "title": "x", "category_id": 99, "start_date": future(5), "end_date": future(1)})
    assert r.status_code == 422
    assert set(r.get_json()["details"]) == {"title", "category_id", "end_date"}


def test_contact_form(client):
    bad = client.post("/api/contact", json={"name": "A", "email": "bad", "message": "short"})
    assert bad.status_code == 422 and set(bad.get_json()["details"]) == {"name", "email", "message"}
    ok = client.post("/api/contact", json={
        "name": "Amina", "email": "a@b.co", "subject": "Hi", "message": "Great app, thank you!"})
    assert ok.status_code == 201


def test_cors_and_json_errors(client):
    r = client.get("/api/nope")
    assert r.status_code == 404 and r.get_json()["error"]
    assert r.headers["Access-Control-Allow-Origin"] == "*"
