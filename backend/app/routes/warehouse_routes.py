from flask import jsonify, request
from sqlalchemy import text
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from flask import current_app
import pandas as pd
import numpy as np
import joblib
import os
import pandas as pd



# Import necessary functions
from ..data_fetcher import fetch_storage_data, fetch_warehouses_dw, add_warehouse_sa, update_warehouse_in_sa,delete_warehouse_sa



def init_storage_routes(app):
    client = MongoClient(app.config['MONGO_URI'])
    db = client['BeautyFlow_db']
    users = db['users']

    @app.route('/api/storage', methods=['GET'])
    @jwt_required()
    def get_storage():
        try:
            # Get the logged-in user's ID from the JWT
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

            # If user not found or not admin, deny access
            if not user or user.get("role") != "admin":
                return jsonify({"error": "Access forbidden: Admins only"}), 403

            # Fetch storage data from SQL Server
            engine = app.config['SQL_ENGINE']
            with engine.connect() as connection:
                result = connection.execute(text("SELECT * FROM fact_Storage"))
                rows = [dict(row._mapping) for row in result]
                return jsonify(rows)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

  
    @app.route('/api/get-storage-data', methods=['GET'])
    def get_storage_data():
        try:
            # Fetch the data from the database
            data = fetch_storage_data()  # Assumes fetch_data will use Flask's dynamic config

            # Convert DataFrame to JSON format
            data_json = data.to_dict(orient="records")  # 'records' will give you a list of dicts
            
            # Return the data as a JSON response
            return jsonify(data_json), 200

        except Exception as e:
            # If there is an error, return an error response
            return jsonify({"error": f"Error fetching data: {e}"}), 500



    # # CRUD SHOPS ROUTES ( alternating between the DW and the SA)
    @app.route('/api/get-storage-warehouse', methods=['GET'])
    @jwt_required()
    def get_warehouses():
        try:
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

            # If user not found or not admin, deny access
            if not user or user.get("role") != "admin" and user.get("role") != "Logistics Manager":
                return jsonify({"error": "Access forbidden: Admins or Logistics Managers only"}), 403
            # Fetch the data from the database
            data = fetch_warehouses_dw()  # Assumes fetch_data will use Flask's dynamic config

            # Convert DataFrame to JSON format
            data_json = data.to_dict(orient="records")  # 'records' will give you a list of dicts
            
            # Return the data as a JSON response
            return jsonify(data_json), 200

        except Exception as e:
            # If there is an error, return an error response
            return jsonify({"error": f"Error fetching data: {e}"}), 500


    @app.route('/api/storage-add-warehouse', methods=['POST'])
    @jwt_required()
    def add_warehouse():
        try:
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

            # If user not found or not admin, deny access
            if not user or user.get("role") != "admin" and user.get("role") != "Logistics Manager":
                return jsonify({"error": "Access forbidden: Admins or Logistics Managers only"}), 403
            data = request.get_json()
            required_fields = ["warehouseid","warehousename", "location", "capacity", "city", "country"]

            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing field {field}"}), 400

            add_warehouse_sa(
            warehouseid=data["warehouseid"],
            warehousename=data["warehousename"],
            location=data["location"],
            capacity=data["capacity"],
            city=data["city"],
            country=data["country"]
            )

            return jsonify({"message": "Warehouse created successfully."}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/api/update-warehouse/<id>', methods=['PUT'])
    @jwt_required()
    def update_warehouse_route(id):
        try:
            # Authenticate the user
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

            # Only admin and storage manager can update
            if not user or (user.get("role") != "admin" and user.get("role") != "Logistics Manager"):
                return jsonify({"error": "Access forbidden: Admins or Logistics Manager only"}), 403

            # Get JSON data from request body
            data = request.get_json()

            # Check required fields
            required_fields = ["warehousename", "location", "capacity", "city", "country"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing field '{field}'"}), 400

            # Call the update function
            update_warehouse_in_sa(
                warehouseid=id,
                warehousename=data["warehousename"],
                location=data["location"],
                capacity=data["capacity"],
                city=data["city"],
                country=data["country"]
            )

            return jsonify({"message": "Warehouse updated successfully."}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500
   
    @app.route('/api/delete-warehouse/<id>', methods=['DELETE'])
    @jwt_required()
    def delete_warehouse(id):
        try:
            user_id = get_jwt_identity()
            user = users.find_one({"_id": ObjectId(user_id)})

        # Only admins or storage managers can delete warehouses
            if not user or (user.get("role") != "admin" and user.get("role") != "Logistics Manager"):
                 return jsonify({"error": "Access forbidden: Admins or Logistics Managers only"}), 403

            try:
            # 🟢 Cast l'ID en entier ici
                 delete_warehouse_sa(int(id))

                 return jsonify({"message": f"Warehouse with ID '{id}' deleted successfully."}), 200

            except Exception as e:
                   if "No warehouse found" in str(e):
                    return jsonify({"error": str(e)}), 404
                   else:
                    return jsonify({"error": str(e)}), 500

        except Exception as e:
           return jsonify({"error": str(e)}), 500
