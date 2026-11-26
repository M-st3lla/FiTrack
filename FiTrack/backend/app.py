"""FiTrack backend entry point.

Run:   python app.py
"""
from flask import Flask, jsonify

import db
from config import Config
from utils import error


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    # Connect to SQLite and initialize a new or incomplete catalogue.
    db.init_app(app)
    with app.app_context():
        db.ensure_initialized()

    # Register every group of routes (one file per feature)
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

    @app.get("/")
    def index():
        return jsonify({
            "service": "FiTrack API",
            "status": "ok",
            "health": "/api/health",
            "frontend": "http://127.0.0.1:5173",
        })

    # CORS so your HTML/JS front end (another origin) can call the API
    @app.after_request
    def add_cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = app.config["CORS_ORIGIN"]
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return resp

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # JSON errors instead of HTML error pages
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
