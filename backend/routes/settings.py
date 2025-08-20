from flask import Blueprint

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    return {"message": "Settings endpoint"}, 200
