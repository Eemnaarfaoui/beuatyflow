# routes.py ou blueprint dans Flask
from flask import Blueprint, jsonify
from app.ml.anomaly_detection import AnomalyDetector

anomaly_bp = Blueprint('anomaly', __name__, url_prefix='/ml')

@anomaly_bp.route('/anomalies', methods=['GET'])
def detect_anomalies():
    detector = AnomalyDetector()
    report = detector.get_anomaly_report()

    if 'error' in report:
        return jsonify(report), 400

    return jsonify(report)
