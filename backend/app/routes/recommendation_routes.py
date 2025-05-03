from flask import Blueprint, jsonify
from app.ml.supplier_recommender import SupplierRecommender

recommendation_bp = Blueprint('recommendation', __name__, url_prefix='/ml')

@recommendation_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    recommender = SupplierRecommender()
    report = recommender.get_recommendation_report()

    if 'error' in report:
        return jsonify(report), 400

    # Convert points DataFrame to list of dicts for JSON serialization
    if 'points' in report:
        report['points'] = report['points'].to_dict('records')

    return jsonify(report)