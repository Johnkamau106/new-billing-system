from flask import Blueprint, request, jsonify
from controllers import customer_controller

customer_bp = Blueprint('customer_bp', __name__)

@customer_bp.route('/api/customers', methods=['GET'])
def get_customers():
    search = request.args.get('search', '')
    status = request.args.get('status', 'all')
    customers = customer_controller.get_all_customers(search, status)
    return jsonify(customers)

@customer_bp.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.get_json()
    new_customer = customer_controller.add_customer(data)
    return jsonify(new_customer), 201

@customer_bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def edit_customer(customer_id):
    data = request.get_json()
    updated_customer = customer_controller.update_customer(customer_id, data)
    return jsonify(updated_customer)

@customer_bp.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def remove_customer(customer_id):
    result = customer_controller.delete_customer(customer_id)
    return jsonify(result)

@customer_bp.route('/api/customers/<int:customer_id>/suspend', methods=['POST'])
def suspend(customer_id):
    customer = customer_controller.suspend_customer(customer_id)
    return jsonify(customer)

@customer_bp.route('/api/customers/<int:customer_id>/activate', methods=['POST'])
def activate(customer_id):
    customer = customer_controller.activate_customer(customer_id)
    return jsonify(customer)
