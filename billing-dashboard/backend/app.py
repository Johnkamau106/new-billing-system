"""
Flask backend for Billing Dashboard
Run: python app.py
This starts the API at http://localhost:4000 and initializes the SQLite database on first run.
"""
import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# SQLAlchemy instance (accessible as: from app import db)
db = SQLAlchemy()

PLANS = {"Hourly", "Daily", "Weekly", "Monthly"}

# Models
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), default="")
    phone = db.Column(db.String(50), default="")
    plan = db.Column(db.String(20), nullable=False, default="Monthly")
    joined = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "plan": self.plan,
            "joined": self.joined.isoformat(),
        }


class Transaction(db.Model):
    __tablename__ = "transactions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(40), nullable=False, default="M-Pesa")
    ref = db.Column(db.String(120), default="")
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship(User, backref=db.backref("transactions", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "plan": self.plan,
            "amount": float(self.amount),
            "method": self.method,
            "ref": self.ref or "",
            "date": self.date.isoformat(),
        }


# Blueprint for API routes
api = Blueprint("api", __name__)


@api.route("/api/health")
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})


# Users endpoints
@api.route("/api/users", methods=["GET"])
def list_users():
    plan = request.args.get("plan", type=str)
    search = request.args.get("search", type=str)
    q = User.query
    if plan and plan != "all":
        q = q.filter(User.plan == plan)
    if search:
        s = f"%{search.lower()}%"
        q = q.filter(
            db.or_(
                db.func.lower(User.name).like(s),
                db.func.lower(User.email).like(s),
                db.func.lower(User.phone).like(s),
                db.func.lower(User.plan).like(s),
            )
        )
    users = [u.to_dict() for u in q.order_by(User.id.desc()).all()]
    return jsonify(users)


@api.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    plan = (data.get("plan") or "Monthly").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    if plan not in PLANS:
        return jsonify({"error": "invalid plan"}), 400
    u = User(name=name, email=email, phone=phone, plan=plan)
    db.session.add(u)
    db.session.commit()
    return jsonify(u.to_dict()), 201


@api.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id: int):
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "not found"}), 404
    db.session.delete(u)
    db.session.commit()
    return jsonify({"ok": True})


# Transactions endpoints
@api.route("/api/transactions", methods=["GET"])
def list_transactions():
    args = request.args
    from_str = args.get("from")
    to_str = args.get("to")
    plan = args.get("plan")
    search = args.get("search")
    sort_by = args.get("sortBy", "date")  # date|amount
    sort_dir = args.get("sortDir", "desc")  # asc|desc
    page = args.get("page", type=int) or 1
    page_size = min(max(args.get("pageSize", type=int) or 100, 1), 500)

    q = Transaction.query

    # Date range
    if from_str:
        try:
            start = datetime.fromisoformat(from_str)
        except ValueError:
            # try YYYY-MM-DD
            start = datetime.strptime(from_str, "%Y-%m-%d")
        q = q.filter(Transaction.date >= start)
    if to_str:
        try:
            end = datetime.fromisoformat(to_str)
        except ValueError:
            end = datetime.strptime(to_str, "%Y-%m-%d")
        # include the full day
        end = end + timedelta(days=1)
        q = q.filter(Transaction.date < end)

    # Plan filter (comma-separated)
    if plan and plan != "all":
        plans = [p.strip() for p in plan.split(",") if p.strip()]
        q = q.filter(Transaction.plan.in_(plans))

    # Join user for search
    if search:
        s = f"%{search.lower()}%"
        q = q.join(User, Transaction.user_id == User.id).filter(
            db.or_(
                db.func.lower(User.name).like(s),
                db.func.lower(User.email).like(s),
                db.func.lower(User.phone).like(s),
                db.func.lower(Transaction.plan).like(s),
                db.func.lower(Transaction.method).like(s),
                db.func.lower(Transaction.ref).like(s),
            )
        )

    # Sorting
    if sort_by == "amount":
        sort_col = Transaction.amount
    else:
        sort_col = Transaction.date
    sort_col = sort_col.asc() if sort_dir == "asc" else sort_col.desc()
    q = q.order_by(sort_col)

    total = q.count()
    items = [t.to_dict() for t in q.limit(page_size).offset((page - 1) * page_size).all()]
    return jsonify({"items": items, "total": total, "page": page, "pageSize": page_size})


@api.route("/api/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json(silent=True) or {}
    user_id = data.get("userId")
    plan = data.get("plan")
    amount = data.get("amount")
    method = data.get("method", "M-Pesa")
    ref = data.get("ref", "")
    date_str = data.get("date")

    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    if plan not in PLANS:
        return jsonify({"error": "invalid plan"}), 400
    try:
        amount = float(amount)
    except Exception:
        return jsonify({"error": "invalid amount"}), 400
    if amount < 0:
        return jsonify({"error": "invalid amount"}), 400

    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "invalid userId"}), 400

    if date_str:
        try:
            d = datetime.fromisoformat(date_str)
        except ValueError:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    d = datetime.strptime(date_str, "%Y-%m-%d")
                except ValueError:
                    return jsonify({"error": "invalid date"}), 400
    else:
        d = datetime.utcnow()

    t = Transaction(user_id=u.id, plan=plan, amount=amount, method=method, ref=ref, date=d)
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201


@api.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
def delete_transaction(txn_id: int):
    t = Transaction.query.get(txn_id)
    if not t:
        return jsonify({"error": "not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True})


# App factory

def create_app():
    app = Flask(__name__)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "billing.db")

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)

    # Create tables and seed on first run
    with app.app_context():
        db.create_all()
        seed_if_empty()

    app.register_blueprint(api)
    return app


# Seed initial data if empty

def seed_if_empty():
    if User.query.count() > 0:
        return

    demo_users = [
        User(name="Alice Mwangi", email="alice@example.com", phone="+254700000001", plan="Monthly"),
        User(name="Brian Otieno", email="brian@example.com", phone="+254700000002", plan="Weekly"),
        User(name="Carol Njeri", email="carol@example.com", phone="+254700000003", plan="Daily"),
        User(name="Daniel Kip", email="daniel@example.com", phone="+254700000004", plan="Hourly"),
    ]
    db.session.add_all(demo_users)
    db.session.commit()

    amounts = {"Hourly": 20, "Daily": 100, "Weekly": 500, "Monthly": 1800}
    methods = ["M-Pesa", "Card", "Cash", "Bank"]

    txns = []
    for i in range(80):
        u = demo_users[i % len(demo_users)]
        plan = u.plan
        base = amounts[plan]
        amount = round(base * (0.9 + os.urandom(1)[0] / 255 * 0.4), 2)
        # spread across last 60 days
        d = datetime.utcnow() - timedelta(days=int(os.urandom(1)[0] / 255 * 60), hours=int(os.urandom(1)[0] / 255 * 23))
        txns.append(Transaction(user_id=u.id, plan=plan, amount=amount, method=methods[i % len(methods)], ref=f"TXN{10000+i}", date=d))

    db.session.add_all(txns)
    db.session.commit()


if __name__ == "__main__":
    # Run the server
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 4000)), debug=True)
