from flask import Blueprint, request, jsonify
from app import db
from models.plans import Plan
from datetime import datetime

plans_bp = Blueprint('plans_bp', __name__)

@plan_routes_bp.route('/plans', methods=['POST'])
def create_plan():
    data = request.get_json()
    name = data.get('name')
    plan_type = data.get('type')
    price = data.get('price')
    billing_period = data.get('billingPeriod')
    speed_down = data.get('speedDown')
    speed_up = data.get('speedUp')
    grace_period = data.get('gracePeriod')
    fup_policy = data.get('fupPolicy')
    features = data.get('features')
    is_active = data.get('isActive', True)

    if not name or not plan_type or price is None or not billing_period:
        return jsonify({'error': 'Missing required plan fields'}), 400

    new_plan = Plan(
        name=name,
        type=plan_type,
        price=price,
        billingPeriod=billing_period,
        speedDown=speed_down,
        speedUp=speed_up,
        gracePeriod=grace_period,
        fupPolicy=fup_policy,
        features=features,
        isActive=is_active
    )
    db.session.add(new_plan)
    db.session.commit()

    return jsonify({'message': 'Plan created successfully', 'plan_id': new_plan.id}), 201

@plan_routes_bp.route('/plans', methods=['GET'])
def get_plans():
    plans = Plan.query.all()
    return jsonify([plan.to_dict() for plan in plans])

@plan_routes_bp.route('/plans/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    return jsonify(plan.to_dict())

@plan_routes_bp.route('/plans/<int:plan_id>', methods=['PUT'])
def update_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    data = request.get_json()

    plan.name = data.get('name', plan.name)
    plan.type = data.get('type', plan.type)
    plan.price = data.get('price', plan.price)
    plan.billingPeriod = data.get('billingPeriod', plan.billingPeriod)
    plan.speedDown = data.get('speedDown', plan.speedDown)
    plan.speedUp = data.get('speedUp', plan.speedUp)
    plan.gracePeriod = data.get('gracePeriod', plan.gracePeriod)
    plan.fupPolicy = data.get('fupPolicy', plan.fupPolicy)
    plan.features = data.get('features', plan.features)
    plan.isActive = data.get('isActive', plan.isActive)
    
    db.session.commit()

    return jsonify({'message': 'Plan updated successfully'}), 200

@plan_routes_bp.route('/plans/<int:plan_id>', methods=['DELETE'])
def delete_plan(plan_id):
    plan = Plan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()

    return jsonify({'message': 'Plan deleted successfully'}), 200
