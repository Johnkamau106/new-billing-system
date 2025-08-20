from app import db
from models.plans import Plan

def get_all_plans():
    plans = Plan.query.all()
    return [plan.to_dict() for plan in plans]

def add_plan(data):
    # Convert features list to comma-separated string for storage
    if "features" in data and isinstance(data["features"], list):
        data["features"] = ",".join(data["features"])

    plan = Plan(**data)
    db.session.add(plan)
    db.session.commit()
    return plan.to_dict()
