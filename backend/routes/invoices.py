from flask import Blueprint, request, jsonify
from app import db
from models import Invoice, InvoiceItem, Client
from datetime import datetime

invoices_bp = Blueprint('invoices_bp', __name__)

@invoices_bp.route('/invoices', methods=['POST'])
def create_invoice():
    data = request.get_json()
    client_id = data.get('client_id')
    due_date = data.get('due_date')
    items = data.get('items')

    if not client_id or not due_date or not items:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        due_date = datetime.fromisoformat(due_date)
    except ValueError:
        return jsonify({'error': 'Invalid due date format'}), 400

    client = Client.query.get(client_id)
    if not client:
        return jsonify({'error': 'Client not found'}), 404

    new_invoice = Invoice(client_id=client_id, due_date=due_date)
    db.session.add(new_invoice)
    db.session.flush()  # Flush to get the new_invoice.id

    for item in items:
        description = item.get('description')
        amount = item.get('amount')
        if not description or not amount:
            db.session.rollback()
            return jsonify({'error': 'Invoice items must have description and amount'}), 400
        new_item = InvoiceItem(invoice_id=new_invoice.id, description=description, amount=amount)
        db.session.add(new_item)

    db.session.commit()

    return jsonify({'message': 'Invoice created successfully', 'invoice_id': new_invoice.id}), 201

@invoices_bp.route('/invoices', methods=['GET'])
def get_invoices():
    query = Invoice.query

    client_id = request.args.get('client_id', type=int)
    status = request.args.get('status')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if client_id:
        query = query.filter_by(client_id=client_id)
    if status:
        query = query.filter_by(status=status)
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(Invoice.created_at >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(Invoice.created_at <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    invoices = query.all()
    return jsonify([{
        'id': invoice.id,
        'client_id': invoice.client_id,
        'due_date': invoice.due_date.isoformat(),
        'status': invoice.status,
        'created_at': invoice.created_at.isoformat(),
        'updated_at': invoice.updated_at.isoformat(),
        'total_amount': invoice.total_amount # Include the new property
    } for invoice in invoices])

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify({
        'id': invoice.id,
        'client_id': invoice.client_id,
        'due_date': invoice.due_date.isoformat(),
        'status': invoice.status,
        'created_at': invoice.created_at.isoformat(),
        'updated_at': invoice.updated_at.isoformat(),
        'items': [{
            'id': item.id,
            'description': item.description,
            'amount': item.amount
        } for item in invoice.items],
        'payments': [{
            'id': payment.id,
            'amount': payment.amount,
            'timestamp': payment.timestamp.isoformat()
        } for payment in invoice.payments]
    })

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()
    status = data.get('status')

    if not status:
        return jsonify({'error': 'Missing status field'}), 400

    invoice.status = status
    db.session.commit()

    return jsonify({'message': 'Invoice status updated successfully'})

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
def void_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    
    # You might want to add more robust checks here, e.g., only allow voiding if status is 'unpaid'
    if invoice.status == 'paid':
        return jsonify({'error': 'Cannot void a paid invoice. Consider a refund or credit.'}), 400

    invoice.status = 'voided' # Or 'cancelled', depending on desired terminology
    db.session.commit()

    return jsonify({'message': 'Invoice voided successfully'}), 200

@invoices_bp.route('/invoices/outstanding', methods=['GET'])
def get_outstanding_invoices():
    outstanding_invoices = Invoice.query.filter(
        (Invoice.status == 'unpaid') | (Invoice.status == 'overdue') | (Invoice.status == 'partially_paid')
    ).all()

    return jsonify([{
        'id': invoice.id,
        'client_id': invoice.client_id,
        'due_date': invoice.due_date.isoformat(),
        'status': invoice.status,
        'total_amount': invoice.total_amount,
        'created_at': invoice.created_at.isoformat(),
        'updated_at': invoice.updated_at.isoformat()
    } for invoice in outstanding_invoices])
