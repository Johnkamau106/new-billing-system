import requests
import base64
from datetime import datetime
from app import db
from models import Payment, Invoice

# M-Pesa API configuration (replace with your actual credentials)
MPESA_CONSUMER_KEY = "your_consumer_key"
MPESA_CONSUMER_SECRET = "your_consumer_secret"
MPESA_SHORTCODE = "your_shortcode"
MPESA_PASSKEY = "your_passkey"
MPESA_INITIATOR_NAME = "your_initiator_name"
MPESA_SECURITY_CREDENTIAL = "your_security_credential"

# M-Pesa API Endpoints
MPESA_AUTH_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
MPESA_STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
MPESA_C2B_REGISTER_URL = "https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl"

def get_mpesa_access_token():
    try:
        response = requests.get(MPESA_AUTH_URL, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
        response.raise_for_status()
        return response.json()['access_token']
    except requests.exceptions.RequestException as e:
        print(f"Error getting M-Pesa access token: {e}")
        return None

def generate_password(timestamp):
    data_to_encode = f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
    encoded_string = base64.b64encode(data_to_encode.encode())
    return encoded_string.decode('utf-8')

def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    access_token = get_mpesa_access_token()
    if not access_token:
        return {"error": "Failed to get M-Pesa access token"}

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = generate_password(timestamp)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": "YOUR_CALLBACK_URL_HERE", # Replace with your actual callback URL
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    try:
        response = requests.post(MPESA_STK_PUSH_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error initiating STK Push: {e}")
        return {"error": str(e)}

def handle_mpesa_callback(callback_data):
    print("Received M-Pesa callback:", callback_data)
    # Process the callback data and update your database
    # This is a simplified example; you'll need to parse the actual M-Pesa callback structure

    result_code = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
    merchant_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('MerchantRequestID')
    checkout_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')

    if result_code == 0:
        # Payment was successful
        amount = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])[0].get('Value')
        mpesa_receipt_number = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])[1].get('Value')
        transaction_date = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])[3].get('Value')
        phone_number = callback_data.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])[4].get('Value')
        account_reference = callback_data.get('Body', {}).get('stkCallback', {}).get('AccountReference') # This might be in a different place

        # Find the associated invoice or client and update payment status
        # You might have a pending payment record created when STK push was initiated
        # For simplicity, let's create a new payment record here
        
        # Assuming account_reference can be used to link to an invoice or client
        # You'll need to implement logic to find the correct invoice/client
        invoice = Invoice.query.filter_by(id=account_reference).first() # Example: if account_reference is invoice_id
        client = None # You might need to find client based on phone_number or other means

        if invoice:
            client = invoice.client # Assuming invoice has a client relationship

        if client:
            new_payment = Payment(
                client_id=client.id,
                invoice_id=invoice.id if invoice else None,
                amount=amount,
                plan_type="M-Pesa", # Or derive from invoice/client plan
                timestamp=datetime.strptime(transaction_date, '%Y%m%d%H%M%S')
            )
            db.session.add(new_payment)
            db.session.commit()

            # Update invoice status if applicable
            if invoice:
                total_invoice_amount = invoice.total_amount
                total_paid_for_invoice = sum(p.amount for p in invoice.payments)
                if total_paid_for_invoice >= total_invoice_amount:
                    invoice.status = 'paid'
                elif total_paid_for_invoice > 0 and total_paid_for_invoice < total_invoice_amount:
                    invoice.status = 'partially_paid'
                db.session.commit()

            print(f"M-Pesa payment successful for {amount} from {phone_number}. Receipt: {mpesa_receipt_number}")
        else:
            print(f"M-Pesa payment received but could not link to client/invoice. Amount: {amount}")
    else:
        # Payment failed or was cancelled
        print(f"M-Pesa STK Push failed. Result Code: {result_code}")

    return {"status": "success"}
