from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from sqlalchemy import func
from models.clients import Client
from models.usage import BandwidthUsage, Bill
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

client_portal = Blueprint('client_portal', __name__)

@client_portal.route('/api/portal/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    client_id = get_jwt_identity()
    client = Client.query.get_or_404(client_id)
    
    # Get latest bandwidth usage
    now = datetime.utcnow()
    start_time = now - timedelta(hours=24)
    
    usage_data = BandwidthUsage.query.filter(
        BandwidthUsage.client_id == client_id,
        BandwidthUsage.timestamp >= start_time
    ).all()
    
    # Get unpaid bills
    unpaid_bills = Bill.query.filter(
        Bill.client_id == client_id,
        Bill.paid == False
    ).all()
    
    # Calculate total usage
    total_download = sum(usage.download_bytes for usage in usage_data)
    total_upload = sum(usage.upload_bytes for usage in usage_data)
    
    return jsonify({
        'client': client.to_dict(),
        'usage_24h': {
            'download': total_download,
            'upload': total_upload,
            'detailed': [usage.to_dict() for usage in usage_data]
        },
        'unpaid_bills': [bill.to_dict() for bill in unpaid_bills]
    })

@client_portal.route('/api/portal/usage/history', methods=['GET'])
@jwt_required()
def get_usage_history():
    client_id = get_jwt_identity()
    days = int(request.args.get('days', 30))
    
    start_time = datetime.utcnow() - timedelta(days=days)
    
    # Get daily usage aggregates
    daily_usage = db.session.query(
        func.date(BandwidthUsage.timestamp).label('date'),
        func.sum(BandwidthUsage.download_bytes).label('download'),
        func.sum(BandwidthUsage.upload_bytes).label('upload')
    ).filter(
        BandwidthUsage.client_id == client_id,
        BandwidthUsage.timestamp >= start_time
    ).group_by(
        func.date(BandwidthUsage.timestamp)
    ).all()
    
    return jsonify({
        'history': [{
            'date': str(day.date),
            'download': day.download,
            'upload': day.upload
        } for day in daily_usage]
    })

@client_portal.route('/api/portal/bills', methods=['GET'])
@jwt_required()
def get_bills():
    client_id = get_jwt_identity()
    
    bills = Bill.query.filter(
        Bill.client_id == client_id
    ).order_by(
        Bill.generated_date.desc()
    ).all()
    
    return jsonify({
        'bills': [bill.to_dict() for bill in bills]
    })
