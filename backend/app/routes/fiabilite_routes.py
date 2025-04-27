from flask import Blueprint, jsonify, send_from_directory
from backend.app.ml.supplier_analysis import load_supplier_data, calculate_reliability_score, generate_reliability_plot
from datetime import datetime
import os

ml_bp = Blueprint('ml', __name__, url_prefix='/ml')

IMAGE_FOLDER = 'models/images'

@ml_bp.route('/images/<filename>')
def get_image(filename):
    base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    image_path = os.path.join(base_dir, IMAGE_FOLDER)
    return send_from_directory(image_path, filename)

@ml_bp.route('/reliability')
def get_supplier_reliability():
    data = load_supplier_data()
    if data.empty:
        return jsonify({"error": "Aucune donnée de fournisseur disponible."}), 404
    data['Date_Dernier_Achat'] = pd.to_datetime(data['Date_Dernier_Achat'])
    data['Recence_Dernier_Achat'] = (datetime(2025, 4, 27) - data['Date_Dernier_Achat']).dt.days
    reliability_ranking = calculate_reliability_score(data.copy())
    return jsonify(reliability_ranking.to_dict(orient='records'))

@ml_bp.route('/reliability_plot')
def get_supplier_reliability_plot():
    data = load_supplier_data()
    if data.empty:
        return jsonify({"error": "Aucune donnée de fournisseur disponible pour le graphique."}), 404
    data['Date_Dernier_Achat'] = pd.to_datetime(data['Date_Dernier_Achat'])
    data['Recence_Dernier_Achat'] = (datetime(2025, 4, 27) - data['Date_Dernier_Achat']).dt.days
    reliability_ranking = calculate_reliability_score(data.copy())
    plot_path = generate_reliability_plot(reliability_ranking.copy())
    if plot_path:
        # Assuming 'static' folder is at the same level as 'app'
        base_dir = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        image_path = os.path.join(base_dir, 'backend', 'app', plot_path)
        return send_from_directory(os.path.dirname(image_path), os.path.basename(image_path))
    else:
        return jsonify({"error": "Erreur lors de la génération du graphique de fiabilité."}), 500