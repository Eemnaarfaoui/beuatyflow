# C:\Users\zinel\IdeaProjects\beuatyflow\backend\app\fiabilite_routes.py
from flask import Blueprint, jsonify, send_from_directory, request
from backend.app.ml.fiabilite import load_supplier_data, calculate_reliability_score, predict_reliability
from datetime import datetime
import os
import pandas as pd

ml_bp = Blueprint('ml', __name__, url_prefix='/ml')
api_bp = Blueprint('api', __name__, url_prefix='/api') # Define the api_bp blueprint

IMAGE_FOLDER = 'models/images'

@ml_bp.route('/images/<filename>')
def get_image(filename):
    base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    image_path = os.path.join(base_dir, IMAGE_FOLDER, filename)
    return send_from_directory(os.path.dirname(image_path), os.path.basename(image_path))

@ml_bp.route('/reliability', methods=['GET'])
def get_supplier_reliability():
    data = load_supplier_data()
    if data.empty:
        return jsonify({"error": "Aucune donnée de fournisseur disponible."}), 404
    data['Date_Dernier_Achat'] = pd.to_datetime(data['Date_Dernier_Achat'])
    data['Recence_Dernier_Achat'] = (datetime.now() - data['Date_Dernier_Achat']).dt.days
    reliability_ranking = calculate_reliability_score(data.copy())
    return jsonify(reliability_ranking.to_dict(orient='records'))

@ml_bp.route('/predict_reliability', methods=['POST'])
def predict_supplier_reliability():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    # Ensure all required features are present in the input data
    required_features = ['Frequence_Achat', 'Volume_Total_Quantite', 'Date_Dernier_Achat', 'Diversite_Produits']
    if not all(feature in data for feature in required_features):
        return jsonify({"error": f"Missing required features: {required_features}"}), 400

    try:
        predicted_score = predict_reliability(data)
        if predicted_score is not None:
            return jsonify({"predicted_reliability_score": predicted_score}), 200
        else:
            return jsonify({"error": "Model not loaded or prediction failed."}), 500
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500