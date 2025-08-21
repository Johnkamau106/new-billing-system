from app import db
from datetime import datetime

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    address = db.Column(db.String(255))
    kycDocument = db.Column(db.String(100))
    installationNotes = db.Column(db.Text)
    
    # RADIUS/Network details
    radius_username = db.Column(db.String(64), unique=True, index=True)
    radius_password = db.Column(db.String(128)) # In production, this should be hashed
    ip_address = db.Column(db.String(45)) # For static IP assignment
    
    # Status and Billing
    status = db.Column(db.String(20), default='pending') # e.g., pending, active, suspended
    balance = db.Column(db.Float, default=0.0)
    last_payment_date = db.Column(db.DateTime, nullable=True)
    last_payment_amount = db.Column(db.Float, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Foreign Key for Plan
    plan_id = db.Column(db.Integer, db.ForeignKey('plan.id'))
    plan = db.relationship('Plan', backref=db.backref('customers', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "address": self.address,
            "kycDocument": self.kycDocument,
            "installationNotes": self.installationNotes,
            "radius_username": self.radius_username,
            "ip_address": self.ip_address,
            "status": self.status,
            "lastPayment": self.last_payment_date.isoformat() if self.last_payment_date else None,
            "currentPlan": self.plan.to_dict() if self.plan else None
        }
