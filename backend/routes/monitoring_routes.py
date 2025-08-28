from flask import Blueprint
from controllers.monitoring_controller import get_alerts, get_online_users

monitoring_bp = Blueprint('monitoring_bp', __name__)

monitoring_bp.route('/alerts', methods=['GET'])(get_alerts)
monitoring_bp.route('/online-users', methods=['GET'])(get_online_users)
