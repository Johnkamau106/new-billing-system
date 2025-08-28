from app import db
from datetime import datetime

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    name = db.Column(db.String(128), nullable=False)
    payload = db.Column(db.Text)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'name': self.name,
            'payload': self.payload,
            'client_id': self.client_id
        }
