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
            total_invoice_amount = invoice.total_amount # Use the property
            # Recalculate total paid for invoice, including the current payment
            total_paid_for_invoice = sum(p.amount for p in invoice.payments) + amount

            if total_paid_for_invoice >= total_invoice_amount:
                invoice.status = 'paid'
            elif total_paid_for_invoice > 0 and total_paid_for_invoice < total_invoice_amount:
                invoice.status = 'partially_paid'
            # If total_paid_for_invoice is 0, status remains 'unpaid' or 'overdue'

    db.session.commit()

    return jsonify({'message': 'Payment recorded successfully', 'payment_id': new_payment.id}), 201

@payments_bp.route('/payments/refund', methods=['POST'])
def record_refund():
    data = request.get_json()
    client_id = data.get('client_id')
    invoice_id = data.get('invoice_id')
    amount = data.get('amount') # This should be a positive value, we'll store it as negative
    plan_type = data.get('plan_type', 'refund') # Default to 'refund' type

    if not client_id or not amount:
        return jsonify({'error': 'Missing required refund fields (client_id, amount)'}), 400

    if amount <= 0:
        return jsonify({'error': 'Refund amount must be positive'}), 400

    new_refund = Payment(
        client_id=client_id,
        invoice_id=invoice_id,
        amount=-amount, # Store as negative amount
        plan_type=plan_type
    )
    db.session.add(new_refund)

    if invoice_id:
        invoice = Invoice.query.get(invoice_id)
        if invoice:
            total_invoice_amount = invoice.total_amount
            # Recalculate total paid for invoice after refund
            # Sum all payments (positive and negative) associated with this invoice
            total_paid_for_invoice = sum(p.amount for p in invoice.payments) + (-amount)

            if total_paid_for_invoice >= total_invoice_amount:
                invoice.status = 'paid'
            elif total_paid_for_invoice > 0 and total_paid_for_invoice < total_invoice_amount:
                invoice.status = 'partially_paid'
            else: # total_paid_for_invoice <= 0
                invoice.status = 'unpaid' # Or 'overdue' if due date passed

    db.session.commit()

    return jsonify({'message': 'Refund recorded successfully', 'refund_id': new_refund.id}), 201

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

@payments_bp.route('/payments/revenue_report', methods=['GET'])
def get_revenue_report():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = Payment.query.filter(Payment.amount > 0) # Only consider positive payments for revenue

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(Payment.timestamp >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(Payment.timestamp <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    payments = query.all()

    total_revenue = sum(p.amount for p in payments)
    revenue_by_plan = {}

    for payment in payments:
        if payment.plan_type not in revenue_by_plan:
            revenue_by_plan[payment.plan_type] = 0
        revenue_by_plan[payment.plan_type] += payment.amount

    report = {
        'total_revenue': total_revenue,
        'revenue_by_plan': revenue_by_plan
    }

    return jsonify(report)

@payments_bp.route('/payments/mpesa/stk_push', methods=['POST'])
def mpesa_stk_push():
    from services.mpesa import initiate_stk_push # Import here to avoid circular dependency if app.py imports payments_bp

    data = request.get_json()
    phone_number = data.get('phone_number')
    amount = data.get('amount')
    account_reference = data.get('account_reference')
    transaction_desc = data.get('transaction_desc', 'Payment for services')

    if not phone_number or not amount or not account_reference:
        return jsonify({'error': 'Missing required fields: phone_number, amount, account_reference'}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid amount format'}), 400

    response = initiate_stk_push(phone_number, amount, account_reference, transaction_desc)
    return jsonify(response)

@payments_bp.route('/payments/mpesa/callback', methods=['POST'])
def mpesa_callback():
    from services.mpesa import handle_mpesa_callback # Import here

    callback_data = request.get_json()
    handle_mpesa_callback(callback_data)
    
    # M-Pesa expects a specific response format for callbacks
    return jsonify({"ResultCode": 0, "ResultDesc": "C2B Callback received successfully"})
