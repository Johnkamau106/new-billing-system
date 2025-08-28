from datetime import datetime, timedelta
from app import db
from models.radius_session import RadiusSession
from models.alert import Alert
from models.clients import Client

def check_client_status():
    """
    Checks for recently disconnected clients and creates alerts.
    This function is intended to be run periodically by a scheduler.
    """
    print("Checking for disconnected clients...")
    # Check for sessions that stopped in the last minute
    one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
    
    recently_stopped_sessions = RadiusSession.query.filter(
        RadiusSession.stop_time >= one_minute_ago
    ).all()

    for session in recently_stopped_sessions:
        # Avoid creating duplicate alerts
        existing_alert = Alert.query.filter_by(
            name='client_disconnected',
            payload=f'{{"session_id": "{session.session_id}"}}'
        ).first()

        if not existing_alert:
            client = Client.query.filter_by(username=session.username).first()
            if client:
                alert = Alert(
                    name='client_disconnected',
                    payload=f'{{"session_id": "{session.session_id}", "username": "{session.username}"}}',
                    client_id=client.id
                )
                db.session.add(alert)
                print(f"Created alert for disconnected client: {session.username}")

    db.session.commit()
    print("Finished checking for disconnected clients.")
