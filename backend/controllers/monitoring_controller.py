from flask import jsonify
from models.alert import Alert
from models.radius_session import RadiusSession

def get_alerts():
    alerts = Alert.query.order_by(Alert.timestamp.desc()).limit(100).all()
    return jsonify([alert.to_dict() for alert in alerts])

def get_online_users():
    online_sessions = RadiusSession.query.filter(RadiusSession.stop_time == None).all()
    return jsonify([session.to_dict() for session in online_sessions])
