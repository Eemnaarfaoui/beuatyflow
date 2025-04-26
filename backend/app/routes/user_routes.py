import random
import string
import smtplib
from email.mime.text import MIMEText
from flask import current_app, request, jsonify
from pymongo import MongoClient
from bson import ObjectId, errors
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)

bcrypt = Bcrypt()

def init_user_routes(app):
    client = MongoClient(app.config['MONGO_URI'])
    db = client['BeautyFlow_db']
    users = db['users']

    # LOGIN
    @app.route('/api/login', methods=['POST'])
    def login_user():
        data = request.get_json()
        user = users.find_one({"email": data["email"]})
        if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Invalid email or password"}), 401
        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify(access_token=access_token), 200

    # LOGOUT (dummy)
    @app.route('/api/logout', methods=['POST'])
    @jwt_required()
    def logout_user():
        return jsonify({"message": "Logged out (client should delete token)"}), 200

    # ADMIN: Add User
    @app.route('/api/users', methods=['POST'])
    @jwt_required()
    def add_user_by_admin():
        admin = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not admin or admin.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403

        data = request.get_json()
        if users.find_one({'email': data['email']}):
            return jsonify({"error": "User already exists"}), 400

        # 1. Generate a random password
        generated_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        # 2. Hash it
        hashed_password = bcrypt.generate_password_hash(generated_password).decode('utf-8')

        # 3. Insert new user into database
        user = {
            "email": data['email'],
            "password": hashed_password,
            "role": data.get("role", "user"),
            "pages": data['pages']
        }
        users.insert_one(user)

        # 4. Send email to the new user
        try:
            send_email_to_user(data['email'], generated_password)
        except Exception as e:
            return jsonify({"error": "User created but failed to send email", "details": str(e)}), 500

        return jsonify({"message": "User created and email sent"}), 201

    # ADMIN: Update User (no password)
    @app.route('/api/users/<id>', methods=['PUT'])
    @jwt_required()
    def admin_update_user(id):
        admin = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not admin or admin.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403

        data = request.get_json()
        if 'password' in data:
            del data['password']
        try:
            result = users.update_one({"_id": ObjectId(id)}, {"$set": data})
            if result.matched_count == 0:
                return jsonify({"error": "User not found"}), 404
        except errors.InvalidId:
            return jsonify({"error": "Invalid user ID"}), 400

        return jsonify({"message": "User updated by admin"}), 200

    # ADMIN: Delete User
    @app.route('/api/users/<id>', methods=['DELETE'])
    @jwt_required()
    def delete_user(id):
        admin = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not admin or admin.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403

        try:
            result = users.delete_one({"_id": ObjectId(id)})
        except errors.InvalidId:
            return jsonify({"error": "Invalid user ID"}), 400

        if result.deleted_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"message": "User deleted successfully"}), 200

    # ADMIN: Get All Users
    @app.route('/api/users', methods=['GET'])
    @jwt_required()
    def get_all_users():
        user = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403

        result = []
        for u in users.find():
            u["_id"] = str(u["_id"])
            del u["password"]
            result.append(u)
        return jsonify(result), 200

    # ADMIN: Get User By ID
    @app.route('/api/users/<id>', methods=['GET'])
    @jwt_required()
    def get_user_by_id(id):
        admin = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not admin or admin.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403

        try:
            user = users.find_one({"_id": ObjectId(id)})
        except errors.InvalidId:
            return jsonify({"error": "Invalid user ID"}), 400

        if not user:
            return jsonify({"error": "User not found"}), 404

        user["_id"] = str(user["_id"])
        del user["password"]
        return jsonify(user), 200

    # USER: Get Own Profile
    @app.route('/api/users/me', methods=['GET'])
    @jwt_required()
    def get_me():
        user = users.find_one({"_id": ObjectId(get_jwt_identity())})
        if not user:
            return jsonify({"error": "User not found"}), 404
        user['_id'] = str(user['_id'])
        del user['password']
        return jsonify(user), 200

    # USER: Edit Own Profile (no role change allowed)
    @app.route('/api/users/me', methods=['PUT'])
    @jwt_required()
    def edit_my_profile():
        user_id = get_jwt_identity()
        data = request.get_json()
        if 'role' in data:
            del data['role']
        try:
            users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
        except errors.InvalidId:
            return jsonify({"error": "Invalid user ID"}), 400
        return jsonify({"message": "Profile updated"}), 200

# Helper: Send email function
def send_email_to_user(receiver_email, generated_password):
    sender_email = "beauty.flow2025@gmail.com"  # Put your sender email
    sender_password = "nmhs sxxc bkpu hzum"  # Use an app password, not real login

    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    subject = "Your BeautyFlow Account Password"
    body = f"""
    Welcome to BeautyFlow!

    Your account has been created.
    Email: {receiver_email}
    Password: {generated_password}

    Please login and change your password immediately.

    Thank you!
    """

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(sender_email, sender_password)
    server.sendmail(sender_email, receiver_email, message.as_string())
    server.quit()
