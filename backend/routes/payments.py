from flask import Blueprint, request, jsonify
from app import db
from models import Payment, Invoice
from datetime import datetime

payments_bp = Blueprint('payments_bp', __name__)

@payments_bp.route('/payments', methods=['POST'])
def record_payment():
    data = request.get_json()
    client_id = data.get('client_id')
    invoice_id = data.get('invoice_id')
    amount = data.get('amount')
    plan_type = data.get('plan_type')

    if not client_id or not amount or not plan_type:
        return jsonify({'error': 'Missing required payment fields'}), 400

    new_payment = Payment(
        client_id=client_id,
        invoice_id=invoice_id,
        amount=amount,
        plan_type=plan_type
    )
    db.session.add(new_payment)

    if invoice_id:
        invoice = Invoice.query.get(invoice_id)
        if invoice:
            # For simplicity, mark invoice as paid if payment covers the full amount
            # A more robust solution would track partial payments and remaining balance
            total_invoice_amount = sum(item.amount for item in invoice.items)
            total_paid_for_invoice = sum(p.amount for p in invoice.payments) + amount

            if total_paid_for_invoice >= total_invoice_amount:
                invoice.status = 'paid'

    db.session.commit()

    return jsonify({'message': 'Payment recorded successfully', 'payment_id': new_payment.id}), 201

@payments_bp.route('/payments', methods=['GET'])
def get_payments():
    payments = Payment.query.all()
    return jsonify([{
        'id': payment.id,
        'client_id': payment.client_id,
        'invoice_id': payment.invoice_id,
        'amount': payment.amount,
        'plan_type': payment.plan_type,
        'timestamp': payment.timestamp.isoformat()
    } for payment in payments])

@payments_bp.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    return jsonify({
        'id': payment.id,
        'client_id': payment.client_id,
        'invoice_id': payment.invoice_id,
        'amount': payment.amount,
        'plan_type': payment.plan_type,
        'timestamp': payment.timestamp.isoformat()
    })
