from app import db
from models.customer import Customer
from models.plans import Plan
from werkzeug.exceptions import NotFound

def get_all_customers(search, status):
    query = Customer.query
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Customer.name.ilike(search_term)) |
            (Customer.phone.ilike(search_term)) |
            (Customer.email.ilike(search_term))
        )
    if status and status != 'all':
        query = query.filter(Customer.status == status)
    
    customers = query.order_by(Customer.name).all()
    return [customer.to_dict() for customer in customers]

def add_customer(data):
    # In a real app, you should hash the password.
    # from werkzeug.security import generate_password_hash
    # if 'radius_password' in data and data['radius_password']:
    #     data['radius_password'] = generate_password_hash(data['radius_password'])

    # An empty plan_id from a form can be an empty string
    if 'plan_id' in data and not data['plan_id']:
        data.pop('plan_id')

    new_customer = Customer(**data)
    db.session.add(new_customer)
    db.session.commit()
    return new_customer.to_dict()

def update_customer(customer_id, data):
    customer = Customer.query.get_or_404(customer_id)

    # Don't update password if it's not provided in the form
    if 'radius_password' in data and not data['radius_password']:
        data.pop('radius_password')

    # An empty plan_id from a form can be an empty string
    if 'plan_id' in data and not data['plan_id']:
        data['plan_id'] = None

    for key, value in data.items():
        if hasattr(customer, key) and key != 'id':
            setattr(customer, key, value)
            
    db.session.commit()
    return customer.to_dict()

def delete_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    db.session.delete(customer)
    db.session.commit()
    return {'message': 'Customer deleted successfully'}

def _update_customer_status(customer_id, new_status):
    customer = Customer.query.get_or_404(customer_id)
    customer.status = new_status
    db.session.commit()
    return customer.to_dict()

def suspend_customer(customer_id):
    return _update_customer_status(customer_id, 'suspended')

def activate_customer(customer_id):
    return _update_customer_status(customer_id, 'active')
