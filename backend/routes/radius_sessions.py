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
