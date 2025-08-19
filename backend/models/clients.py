from app import db


class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "balance": self.balance}
