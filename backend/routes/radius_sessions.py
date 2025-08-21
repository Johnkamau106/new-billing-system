from flask import Blueprint, jsonify
from models.radius_session import RadiusSession

radius_sessions_bp = Blueprint('radius_sessions', __name__)

@radius_sessions_bp.route('/radius_sessions', methods=['GET'])
def get_radius_sessions():
    sessions = RadiusSession.query.all()
    return jsonify([session.to_dict() for session in sessions])
