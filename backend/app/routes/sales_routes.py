from flask import jsonify
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
from ..ml.predicting_sales import TimeSeriesLinearRegression, fetch_sales_data, run_time_series_forecast
# Update model path to use os.path for better path handling


# Import necessary functions
from ..data_fetcher import fetch_sales_data
from ..data_fetcher import preprocess_data


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

    # Fetch sales data using fetch_data function (this route is correctly placed within init_sales_routes)
    @app.route('/api/get-sales-data', methods=['GET'])
    def get_sales_data():
        try:
            # Fetch the data from the database
            data = fetch_sales_data()  # Assumes fetch_data will use Flask's dynamic config

            # Convert DataFrame to JSON format
            data_json = data.to_dict(orient="records")  # 'records' will give you a list of dicts
            
            # Return the data as a JSON response
            return jsonify(data_json), 200

        except Exception as e:
            # If there is an error, return an error response
            return jsonify({"error": f"Error fetching data: {e}"}), 500


    @app.route('/forecast', methods=['GET'])
    def forecast():
        try:
            # Fetch data from SQL Server
            df = fetch_sales_data()

            # Run time series forecasting
            results = run_time_series_forecast(df)

            # Return forecasts as JSON
            forecasts = results['forecasts'].to_dict(orient='records')
            return jsonify(forecasts)
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/train', methods=['POST'])
    def train():
        try:
            # Fetch data from SQL Server
            df = fetch_sales_data()

            # Initialize forecaster and train the model
            forecaster = TimeSeriesLinearRegression()
            model_results = forecaster.train_model(df)

            # Return the model's performance metrics
            performance_metrics = {}
            for segment_key, metrics in forecaster.performance_metrics.items():
                performance_metrics[segment_key] = metrics
            
            return jsonify({"metrics": performance_metrics})
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
