from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.clients import Client
from app import db
import datetime

auth_bp = Blueprint('auth', __name__)

# For demo: hardcoded admin username
ADMIN_USERNAMES = ["admin"]

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
	data = request.get_json()
	username = data.get('username')
	password = data.get('password')
	if not username or not password:
		return jsonify({"msg": "Missing username or password"}), 400

	user = Client.query.filter_by(username=username).first()
	if not user or user.password != password:
		return jsonify({"msg": "Invalid credentials"}), 401

	# Determine role
	role = 'admin' if username in ADMIN_USERNAMES else 'client'

	# Create JWT with role
	access_token = create_access_token(
		identity=user.id,
		additional_claims={"role": role},
		expires_delta=datetime.timedelta(days=1)
	)
	return jsonify({"access_token": access_token, "role": role, "user_id": user.id})
