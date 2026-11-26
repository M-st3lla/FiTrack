"""Nutrition recommendations tied to workout categories."""
from flask import Blueprint, jsonify, request

from auth import login_required
from db import get_db
from utils import rows

bp = Blueprint("nutrition", __name__, url_prefix="/api/nutrition")


@bp.get("")
@login_required
def list_nutrition():
    """Return nutrition recommendations for authenticated users."""
    category_id = request.args.get("category_id", type=int)
    sql = (
        "SELECT n.id, n.category_id, c.name AS category, n.title, n.foods, n.description "
        "FROM nutrition_tips n JOIN workout_categories c ON c.id = n.category_id"
    )
    params = ()
    if category_id is not None:
        sql += " WHERE n.category_id = ?"
        params = (category_id,)
    data = get_db().execute(sql + " ORDER BY n.id", params).fetchall()
    tips = rows(data)
    for t in tips:
        t["foods"] = [f.strip() for f in t["foods"].split(",")]
    return jsonify({"nutrition": tips})
