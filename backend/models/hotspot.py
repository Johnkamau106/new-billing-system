from app import db
from datetime import datetime

class Hotspot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=True)
    ip_address = db.Column(db.String(15), nullable=True)
    mac_address = db.Column(db.String(17), nullable=True)
    status = db.Column(db.String(20), default='unknown')
    last_seen = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'ip_address': self.ip_address,
            'mac_address': self.mac_address,
            'status': self.status,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None
        }
