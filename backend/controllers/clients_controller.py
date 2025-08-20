from app import db
from models.clients import Client
from models.plans import Plan # Import the Plan model


def get_all_clients():
    clients = Client.query.all()
    return [c.to_dict() for c in clients]

def add_client(data):
    # Extract RADIUS-related data
    radius_username = data.get("radius_username")
    radius_password = data.get("radius_password")
    ip_address = data.get("ip_address")
    plan_id = data.get("plan_id")

    bandwidth_limit = None
    if plan_id:
        plan = Plan.query.get(plan_id)
        if plan:
            # Assuming speedDown is in Mbps, convert to Kbps for bandwidth_limit
            bandwidth_limit = plan.speedDown * 1024 # Convert Mbps to Kbps

    client = Client(
        name=data["name"],
        balance=data.get("balance", 0.0),
        username=radius_username,
        password=radius_password,
        ip_address=ip_address,
        bandwidth_limit=bandwidth_limit,
        # Other fields from the Client model that might be passed in 'data'
        # e.g., active=data.get("active", True), session_timeout=data.get("session_timeout", 3600)
    )
    db.session.add(client)
    db.session.commit()
    return client.to_dict()
