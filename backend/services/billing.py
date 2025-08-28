from app import db
from models.client import Client
from models.plans import Plan
from models.invoice import Invoice, InvoiceItem
from models.radius_session import RadiusSession
from datetime import datetime, timedelta

def generate_invoices():
    print("Starting invoice generation...")
    clients = Client.query.all()

    for client in clients:
        # Assuming client has a plan_id linked to a Plan
        # You might need to add a plan_id to your Client model if not already present
        # For now, let's assume client.plan_id exists and links to a Plan
        plan = Plan.query.get(client.plan_id) if hasattr(client, 'plan_id') else None

        if not plan:
            print(f"Client {client.username} has no plan or plan not found. Skipping invoice generation.")
            continue

        # Determine if an invoice needs to be generated
        # This logic needs to be refined based on your billing cycle and last invoice date
        # For simplicity, let's assume monthly billing and check if last invoice was more than a month ago
        last_invoice = Invoice.query.filter_by(client_id=client.id).order_by(Invoice.created_at.desc()).first()

        should_invoice = False
        if not last_invoice:
            should_invoice = True # No previous invoice, generate one
        else:
            # Basic monthly check: if last invoice was created more than 30 days ago
            if (datetime.utcnow() - last_invoice.created_at).days >= 30: # Or parse plan.billingPeriod
                should_invoice = True

        if should_invoice:
            print(f"Generating invoice for client: {client.username} (Plan: {plan.name})")
            # Create a new invoice
            new_invoice = Invoice(
                client_id=client.id,
                due_date=datetime.utcnow() + timedelta(days=7), # Due in 7 days
                status='unpaid'
            )
            db.session.add(new_invoice)
            db.session.flush() # To get new_invoice.id

            # Add invoice item based on plan price
            invoice_item = InvoiceItem(
                invoice_id=new_invoice.id,
                description=f"Monthly subscription for {plan.name} plan",
                amount=plan.price
            )
            db.session.add(invoice_item)

            # Optional: Add usage-based charges if applicable
            # This would involve querying RadiusSession for usage since last invoice
            # For now, we'll stick to plan-based billing.

            db.session.commit()
            print(f"Invoice {new_invoice.id} generated for {client.username}.")
        else:
            print(f"Client {client.username} does not need an invoice yet.")

    print("Invoice generation finished.")

def check_overdue_invoices():
    print("Checking for overdue invoices...")
    overdue_invoices = Invoice.query.filter(
        Invoice.status == 'unpaid',
        Invoice.due_date < datetime.utcnow()
    ).all()

    for invoice in overdue_invoices:
        invoice.status = 'overdue'
        print(f"Invoice {invoice.id} for client {invoice.client_id} marked as overdue.")
    
    db.session.commit()
    print("Finished checking for overdue invoices.")
