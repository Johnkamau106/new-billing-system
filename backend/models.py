from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Client(db.Model):
    __tablename__ = "clients"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50))
    plan_type = db.Column(db.String(20), nullable=False)  # hourly,daily,weekly,monthly
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    payments = db.relationship("Payment", backref="client", lazy=True)

class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
