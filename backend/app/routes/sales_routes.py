from flask import jsonify
from sqlalchemy import text
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId

def init_sales_routes(app):
    client = MongoClient(app.config['MONGO_URI'])
    db = client['BeautyFlow_db']
    users = db['users']

    @app.route('/api/sales', methods=['GET'])
    @jwt_required()
    def get_sales():
        try:
            # Get the logged-in user's ID from the JWT
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

            # If user not found or not admin, deny access
            if not user or user.get("role") != "admin":
                return jsonify({"error": "Access forbidden: Admins only"}), 403

            # Fetch sales data from SQL Server
            engine = app.config['SQL_ENGINE']
            with engine.connect() as connection:
                result = connection.execute(text("SELECT TOP 100 * FROM fact_sales"))
                rows = [dict(row._mapping) for row in result]
                return jsonify(rows)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
