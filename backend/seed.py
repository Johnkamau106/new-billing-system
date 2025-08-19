import random
from datetime import datetime, timedelta
from app import create_app
from models import db, Client, Payment

plans = ["hourly", "daily", "weekly", "monthly"]
amounts = {"hourly": 20, "daily": 100, "weekly": 500, "monthly": 1800}

app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()

    clients = []
    for i in range(80):
        plan = random.choice(plans)
        c = Client(name=f"Client {i+1}", phone=f"0700{i:04d}", plan_type=plan, active=random.random() > 0.2)
        db.session.add(c)
        clients.append(c)
    db.session.commit()

    now = datetime.utcnow()
    for c in clients:
        for d in range(0, 30):
            if random.random() < 0.25:
                ts = (datetime(now.year, now.month, now.day) - timedelta(days=d)
                      + timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59)))
                db.session.add(Payment(client_id=c.id, amount=amounts[c.plan_type], plan_type=c.plan_type, timestamp=ts))
    db.session.commit()
    print("Seeded sample clients + payments.")
