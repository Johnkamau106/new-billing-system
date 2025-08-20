from flask import Blueprint, request, jsonify
from controllers.plans_controller import get_all_plans, add_plan

plans_bp = Blueprint("plans", __name__)

@plans_bp.route("/", methods=["GET"])
def list_plans():
    return jsonify(get_all_plans())

@plans_bp.route("/", methods=["POST"])
def create_plan():
    data = request.get_json()
    return jsonify(add_plan(data)), 201
