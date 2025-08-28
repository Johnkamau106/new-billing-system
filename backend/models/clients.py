from app import db
from datetime import datetime


class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)
    
    # RADIUS specific fields
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(64), nullable=False)
    ip_address = db.Column(db.String(15), nullable=True)
    active = db.Column(db.Boolean, default=True)
    bandwidth_limit = db.Column(db.Integer, nullable=True)  # in Kbps
    session_timeout = db.Column(db.Integer, default=3600)  # in seconds
    last_login = db.Column(db.DateTime, nullable=True)

    # Billing specific fields
    plan_id = db.Column(db.Integer, db.ForeignKey('plan.id'), nullable=True) # Allow null for existing clients without a plan
    plan = db.relationship('Plan', backref='clients')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "balance": self.balance,
            "username": self.username,
            "ip_address": self.ip_address,
            "active": self.active,
            "bandwidth_limit": self.bandwidth_limit,
            "session_timeout": self.session_timeout,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "plan_id": self.plan_id
        }