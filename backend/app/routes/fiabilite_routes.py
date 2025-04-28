from flask import Blueprint, jsonify, request
from backend.app.ml.fiabilite import load_supplier_data, calculate_reliability_score, predict_future_purchase, classify_supplier_reliability, train_purchase_prediction_model
from datetime import datetime
import pandas as pd

ml_bp = Blueprint('ml', __name__, url_prefix='/ml')

@ml_bp.route('/train_model', methods=['POST'])
def train_model():
    model, scaler = train_purchase_prediction_model()
    if model and scaler:
        return jsonify({"message": "Modèle de prédiction entraîné et sauvegardé."}), 200
    else:
        return jsonify({"error": "Échec de l'entraînement du modèle."}), 500

@ml_bp.route('/predict_purchase', methods=['POST'])
def predict_purchase():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Aucune donnée fournie."}), 400

    required_features = ['Frequence_Achat', 'Volume_Total_Quantite', 'Date_Dernier_Achat', 'Diversite_Produits']
    if not all(feature in data for feature in required_features):
        return jsonify({"error": f"Données manquantes. Requis: {required_features}"}), 400

    prediction = predict_future_purchase(data)
    if prediction is not None:
        return jsonify({"predicted_purchase_volume": prediction}), 200
    else:
        return jsonify({"error": "Échec de la prédiction."}), 500

@ml_bp.route('/reliability', methods=['GET'])
def get_supplier_reliability():
    data = load_supplier_data()
    if data.empty:
        return jsonify({"error": "Aucune donnée de fournisseur disponible."}), 404
    data['Date_Dernier_Achat'] = pd.to_datetime(data['Date_Dernier_Achat'])
    data['Recence_Dernier_Achat'] = (datetime.now() - data['Date_Dernier_Achat']).dt.days
    reliability_data = classify_supplier_reliability(data.copy())
    return jsonify(reliability_data.to_dict(orient='records'))