from flask import request, jsonify
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

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = {"email": data['email'], "password": hashed_password, "role": data.get("role", "user"), "pages": data['pages']}
        users.insert_one(user)
        return jsonify({"message": "User created by admin"}), 201

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

    # USER: Edit Own Profile (no role)
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
