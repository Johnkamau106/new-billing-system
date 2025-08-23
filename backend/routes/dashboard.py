from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from models.usage import Bill
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    # Fetch monthly income history from Bill model
    monthly_income_history = db.session.query(
        func.strftime('%Y-%m', Bill.generated_date).label('month'),
        func.sum(Bill.amount).label('total_income')
    ).group_by(
        func.strftime('%Y-%m', Bill.generated_date)
    ).order_by(
        func.strftime('%Y-%m', Bill.generated_date)
    ).all()

    # Format for frontend
    formatted_monthly_income = [
        {'month': row.month, 'income': row.total_income}
        for row in monthly_income_history
    ]

    # Generate some realistic sample data for other parts of the dashboard
    current_time = datetime.now()
    hourly_data = []
    
    # Generate 24 hours of data
    for i in range(24):
        time = current_time - timedelta(hours=23-i)
        hourly_data.append({
            'time': time.strftime('%H:%M'),
            'downloads': random.randint(100, 1000),
            'uploads': random.randint(50, 500),
            'revenue': random.randint(500, 2000)
        })

    # Calculate daily total from hourly data
    daily_total = sum(hour['revenue'] for hour in hourly_data)
    
    return jsonify({
        'income': {
            'today': daily_total,
            'thisMonth': daily_total * 20,  # Simulate month total
            'entries': len([h for h in hourly_data if h['revenue'] > 0]),
            'hourly': hourly_data,
            'monthlyIncomeHistory': formatted_monthly_income # Add historical data
        },
        'users': {
            'active': 41,
            'total': 2641,
            'trend': [
                {'date': (current_time - timedelta(days=i)).strftime('%Y-%m-%d'), 
                 'users': random.randint(2500, 2700)}
                for i in range(7, 0, -1)
            ]
        },
        'tickets': {
            'open': 0,
            'pending': 0,
            'solved': 0,
            'escalated': 0
        },
        'connections': {
            'online': {
                'clients': 0,
                'hotspot': 21
            },
            'active': {
                'clients': 41,
                'hotspot': 2626
            },
            'overdue': {
                'clients': 0,
                'hotspot': 3091
            },
            'offline': {
                'clients': 0,
                'hotspot': 363
            },
            'inactive': {
                'clients': 363,
                'disabled': 0
            }
        },
        'traffic': {
            'daily': {
                'download': sum(h['downloads'] for h in hourly_data),
                'upload': sum(h['uploads'] for h in hourly_data)
            },
            'hourly': hourly_data
        }
    })