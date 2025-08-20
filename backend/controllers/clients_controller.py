from app import db
from models.clients import Client


def get_all_clients():
    clients = Client.query.all()
    return [c.to_dict() for c in clients]

def add_client(data):
    client = Client(name=data["name"], balance=data.get("balance", 0.0))
    db.session.add(client)
    db.session.commit()
    return client.to_dict()
