from flask import Blueprint, request, jsonify
from app.ml.preferences import ModeleClassificationRF

marketing_bp = Blueprint('marketing', __name__, url_prefix='/marketing')
modele_rf = ModeleClassificationRF()
modele_rf.train() # Entraîner le modèle au démarrage de l'application (ou le charger)

@marketing_bp.route('/predict_preference', methods=['POST'])
def predict_preference():
    try:
        data = request.get_json()
        prediction = modele_rf.predict(data)
        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500