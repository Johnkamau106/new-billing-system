from flask import Blueprint
from app import db
from models.clients import Client
from models.plans import Plan
from models.invoice import Invoice, InvoiceItem
from datetime import datetime, timedelta

cli_bp = Blueprint('cli', __name__)

@cli_bp.cli.command('generate-monthly-invoices')
def generate_monthly_invoices():
    """Generates monthly invoices for all active clients based on their plans."""
    print("Starting monthly invoice generation...")

    clients = Client.query.filter_by(active=True).all()
    generated_count = 0

    for client in clients:
        if not client.plan_id:
            print(f"Skipping client {client.name} (ID: {client.id}): No plan associated.")
            continue

        plan = Plan.query.get(client.plan_id)
        if not plan:
            print(f"Skipping client {client.name} (ID: {client.id}): Associated plan (ID: {client.plan_id}) not found.")
            continue

        # Determine if an invoice needs to be generated for this month
        # This logic assumes monthly billing and checks if an invoice for the current month already exists
        current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        existing_invoice = Invoice.query.filter(
            Invoice.client_id == client.id,
            Invoice.created_at >= current_month
        ).first()

        if existing_invoice:
            print(f"Client {client.name} (ID: {client.id}): Invoice for current month already exists. Skipping.")
            continue

        # Generate invoice
        amount = plan.price
        description = f"Monthly subscription for {plan.name} plan ({plan.billingPeriod})"
        due_date = (datetime.utcnow() + timedelta(days=plan.gracePeriod or 7)).replace(hour=23, minute=59, second=59)

        new_invoice = Invoice(
            client_id=client.id,
            due_date=due_date,
            status='unpaid'
        )
        db.session.add(new_invoice)
        db.session.flush()  # Flush to get the new_invoice.id

        new_item = InvoiceItem(
            invoice_id=new_invoice.id,
            description=description,
            amount=amount
        )
        db.session.add(new_item)

        db.session.commit()
        generated_count += 1
        print(f"Generated invoice for client {client.name} (ID: {client.id}) for {amount} KSH.")

    print(f"Finished invoice generation. Total {generated_count} invoices generated.")