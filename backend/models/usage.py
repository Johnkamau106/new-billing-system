from app import db
from datetime import datetime

class BandwidthUsage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    download_bytes = db.Column(db.BigInteger, default=0)
    upload_bytes = db.Column(db.BigInteger, default=0)
    session_id = db.Column(db.String(32), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "timestamp": self.timestamp.isoformat(),
            "download_bytes": self.download_bytes,
            "upload_bytes": self.upload_bytes,
            "session_id": self.session_id
        }

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    generated_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "amount": self.amount,
            "description": self.description,
            "generated_date": self.generated_date.isoformat(),
            "due_date": self.due_date.isoformat(),
            "paid": self.paid
        }
