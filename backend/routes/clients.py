from flask import Blueprint, request, jsonify
from controllers.clients_controller import get_all_clients, add_client



clients_bp = Blueprint("clients", __name__)

@clients_bp.route("/", methods=["GET"])
def list_clients():
    return jsonify(get_all_clients())

@clients_bp.route("/", methods=["POST"])
def create_client():
    data = request.get_json()
    return jsonify(add_client(data)), 201
