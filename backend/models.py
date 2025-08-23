from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Client(db.Model):
    __tablename__ = "clients"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)  # hourly,daily,weekly,monthly
    bandwidth_limit = db.Column(db.String(50))
    quota = db.Column(db.String(50))
    balance = db.Column(db.Float, default=0.0)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    payments = db.relationship("Payment", backref="client", lazy=True)
    hotspot_sessions = db.relationship("HotspotSession", backref="client", lazy=True)

class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    plan_type = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

class Hotspot(db.Model):
    __tablename__ = "hotspots"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(255))
    ip_address = db.Column(db.String(50))

    sessions = db.relationship("HotspotSession", backref="hotspot", lazy=True)

class HotspotSession(db.Model):
    __tablename__ = "hotspot_sessions"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    hotspot_id = db.Column(db.Integer, db.ForeignKey("hotspots.id"), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    data_used_upload = db.Column(db.BigInteger, default=0)
    data_used_download = db.Column(db.BigInteger, default=0)
    status = db.Column(db.String(20), default="online")
    ip_address = db.Column(db.String(50))
    mac_address = db.Column(db.String(50))

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='unpaid')  # unpaid, paid, overdue
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade="all, delete-orphan")
    payments = db.relationship('Payment', backref='invoice', lazy=True)

    def __repr__(self):
        return f"<Invoice {self.id}>"

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<InvoiceItem {self.id}>"