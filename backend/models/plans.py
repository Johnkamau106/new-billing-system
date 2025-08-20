from app import db
from datetime import datetime

class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    type = db.Column(db.String(50)) # e.g., "broadband", "mobile"
    price = db.Column(db.Float, nullable=False)
    billingPeriod = db.Column(db.String(50)) # e.g., "30 days", "1 month"
    speedDown = db.Column(db.Integer) # in Mbps
    speedUp = db.Column(db.Integer) # in Mbps
    gracePeriod = db.Column(db.Integer) # in days
    fupPolicy = db.Column(db.String(255), nullable=True)
    features = db.Column(db.String(500), nullable=True) # Stored as comma-separated string or JSON string
    isActive = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "price": self.price,
            "billingPeriod": self.billingPeriod,
            "speedDown": self.speedDown,
            "speedUp": self.speedUp,
            "gracePeriod": self.gracePeriod,
            "fupPolicy": self.fupPolicy,
            "features": self.features.split(',') if self.features else [],
            "isActive": self.isActive,
            "created_at": self.created_at.isoformat()
        }
