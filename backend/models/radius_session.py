from app import db
from datetime import datetime

class RadiusSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), unique=True, nullable=False)
    username = db.Column(db.String(64), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    stop_time = db.Column(db.DateTime, nullable=True)
    input_octets = db.Column(db.BigInteger, default=0)
    output_octets = db.Column(db.BigInteger, default=0)
    session_time = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "username": self.username,
            "start_time": self.start_time.isoformat(),
            "stop_time": self.stop_time.isoformat() if self.stop_time else None,
            "input_octets": self.input_octets,
            "output_octets": self.output_octets,
            "session_time": self.session_time
        }
