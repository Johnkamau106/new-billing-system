from flask import Blueprint, jsonify, request, make_response
from models.radius_session import RadiusSession
from datetime import datetime
import io
import csv

radius_sessions_bp = Blueprint('radius_sessions', __name__)

@radius_sessions_bp.route('/radius_sessions', methods=['GET'])
def get_radius_sessions():
    query = RadiusSession.query

    username = request.args.get('username')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if username:
        query = query.filter(RadiusSession.username.ilike(f'%{username}%'))

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            # To include the whole end day, filter up to the end of the day
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    sessions = query.all()
    return jsonify([session.to_dict() for session in sessions])

@radius_sessions_bp.route('/radius_sessions/export', methods=['GET'])
def export_radius_sessions():
    query = RadiusSession.query

    username = request.args.get('username')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if username:
        query = query.filter(RadiusSession.username.ilike(f'%{username}%'))

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    sessions = query.all()

    si = io.StringIO()
    cw = csv.writer(si)

    # Write headers
    headers = ["ID", "Session ID", "Username", "Start Time", "Stop Time", "Input Octets", "Output Octets", "Session Time"]
    cw.writerow(headers)

    # Write data rows
    for session in sessions:
        cw.writerow([
            session.id,
            session.session_id,
            session.username,
            session.start_time.isoformat() if session.start_time else '',
            session.stop_time.isoformat() if session.stop_time else '',
            session.input_octets,
            session.output_octets,
            session.session_time
        ])

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=radius_sessions.csv"
    output.headers["Content-type"] = "text/csv"
    return output

@radius_sessions_bp.route('/radius_sessions/daily_summary', methods=['GET'])
def get_daily_summary():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = RadiusSession.query

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    # Group by username and date, summing up octets and session time
    # Note: This requires a database that supports date functions in GROUP BY
    # For SQLite, you might use strftime('%Y-%m-%d', start_time)
    # For PostgreSQL, you might use DATE(start_time)
    # For simplicity, we'll fetch all relevant sessions and aggregate in Python for now.
    # For large datasets, this should be done at the database level.

    sessions = query.all()

    daily_summary = {}
    for session in sessions:
        date_key = session.start_time.strftime('%Y-%m-%d')
        username = session.username

        if username not in daily_summary:
            daily_summary[username] = {}
        if date_key not in daily_summary[username]:
            daily_summary[username][date_key] = {
                'input_octets': 0,
                'output_octets': 0,
                'session_time': 0
            }

        daily_summary[username][date_key]['input_octets'] += session.input_octets
        daily_summary[username][date_key]['output_octets'] += session.output_octets
        daily_summary[username][date_key]['session_time'] += session.session_time

    # Format the output for easier consumption
    formatted_summary = []
    for username, dates in daily_summary.items():
        for date_key, data in dates.items():
            formatted_summary.append({
                'username': username,
                'date': date_key,
                'input_octets': data['input_octets'],
                'output_octets': data['output_octets'],
                'session_time': data['session_time']
            })
    
    return jsonify(formatted_summary)

@radius_sessions_bp.route('/radius_sessions/monthly_summary', methods=['GET'])
def get_monthly_summary():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = RadiusSession.query

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    sessions = query.all()

    monthly_summary = {}
    for session in sessions:
        month_key = session.start_time.strftime('%Y-%m') # Group by YYYY-MM
        username = session.username

        if username not in monthly_summary:
            monthly_summary[username] = {}
        if month_key not in monthly_summary[username]:
            monthly_summary[username][month_key] = {
                'input_octets': 0,
                'output_octets': 0,
                'session_time': 0
            }

        monthly_summary[username][month_key]['input_octets'] += session.input_octets
        monthly_summary[username][month_key]['output_octets'] += session.output_octets
        monthly_summary[username][month_key]['session_time'] += session.session_time

    formatted_summary = []
    for username, months in monthly_summary.items():
        for month_key, data in months.items():
            formatted_summary.append({
                'username': username,
                'month': month_key,
                'input_octets': data['input_octets'],
                'output_octets': data['output_octets'],
                'session_time': data['session_time']
            })
    
    return jsonify(formatted_summary)

@radius_sessions_bp.route('/radius_sessions/top_users', methods=['GET'])
def get_top_users():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    limit = int(request.args.get('limit', 10))
    sort_by = request.args.get('sort_by', 'data_usage') # 'data_usage' or 'session_time'

    query = RadiusSession.query

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    sessions = query.all()

    user_summary = {}
    for session in sessions:
        username = session.username

        if username not in user_summary:
            user_summary[username] = {
                'input_octets': 0,
                'output_octets': 0,
                'session_time': 0,
                'total_data_usage': 0 # input + output
            }

        user_summary[username]['input_octets'] += session.input_octets
        user_summary[username]['output_octets'] += session.output_octets
        user_summary[username]['session_time'] += session.session_time
        user_summary[username]['total_data_usage'] += (session.input_octets + session.output_octets)

    # Sort users
    if sort_by == 'session_time':
        sorted_users = sorted(user_summary.items(), key=lambda item: item[1]['session_time'], reverse=True)
    else: # Default to data_usage
        sorted_users = sorted(user_summary.items(), key=lambda item: item[1]['total_data_usage'], reverse=True)

    # Take top N users
    top_users = []
    for username, data in sorted_users[:limit]:
        top_users.append({
            'username': username,
            'input_octets': data['input_octets'],
            'output_octets': data['output_octets'],
            'total_data_usage': data['total_data_usage'],
            'session_time': data['session_time']
        })
    
    return jsonify(top_users)

@radius_sessions_bp.route('/radius_sessions/statistics', methods=['GET'])
def get_session_statistics():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    query = RadiusSession.query

    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400

    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            query = query.filter(RadiusSession.start_time <= end_date.replace(hour=23, minute=59, second=59))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400

    sessions = query.all()

    total_sessions = len(sessions)
    total_input_octets = sum(s.input_octets for s in sessions)
    total_output_octets = sum(s.output_octets for s in sessions)
    total_session_time = sum(s.session_time for s in sessions)

    completed_sessions = [s for s in sessions if s.stop_time is not None]
    num_completed_sessions = len(completed_sessions)

    avg_session_time = (total_session_time / num_completed_sessions) if num_completed_sessions > 0 else 0
    avg_data_usage_per_session = ((total_input_octets + total_output_octets) / num_completed_sessions) if num_completed_sessions > 0 else 0

    statistics = {
        'total_sessions': total_sessions,
        'total_input_octets': total_input_octets,
        'total_output_octets': total_output_octets,
        'total_data_transfer': total_input_octets + total_output_octets,
        'total_session_time': total_session_time,
        'num_completed_sessions': num_completed_sessions,
        'average_session_time': avg_session_time,
        'average_data_usage_per_session': avg_data_usage_per_session
    }
    
    return jsonify(statistics)
