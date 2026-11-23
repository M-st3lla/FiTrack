"""FiTrack backend entry point.

Run:   python app.py
"""
import os

from flask import Flask, jsonify

import db
from config import Config
from utils import error


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    # 1. Make sure the folder for the database file exists
    os.makedirs(os.path.dirname(app.config["DATABASE"]), exist_ok=True)

    # 2. Connect the database layer to the app, and create it on first run
    db.init_app(app)
    if not os.path.exists(app.config["DATABASE"]):
        with app.app_context():
            db.init_db()

    # 3. Register every group of routes (one file per feature)
    from routes.auth_routes import bp as auth_bp
    from routes.profile import bp as profile_bp
    from routes.workouts import bp as workouts_bp
    from routes.nutrition import bp as nutrition_bp
    from routes.schedule import bp as schedule_bp
    from routes.goals import bp as goals_bp
    from routes.contact import bp as contact_bp
    from routes.dashboard import bp as dashboard_bp

    for bp in (auth_bp, profile_bp, workouts_bp, nutrition_bp,
               schedule_bp, goals_bp, contact_bp, dashboard_bp):
        app.register_blueprint(bp)

    # 4. CORS so your HTML/JS front end (another origin) can call the API
    @app.after_request
    def add_cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = app.config["CORS_ORIGIN"]
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return resp

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # 5. JSON errors instead of HTML error pages
    @app.errorhandler(404)
    def not_found(_e):
        return error("Resource not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return error("Method not allowed.", 405)

    @app.errorhandler(500)
    def server_error(_e):
        return error("Internal server error.", 500)

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
