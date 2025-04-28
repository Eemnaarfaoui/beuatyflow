from flask import Blueprint, jsonify, render_template_string
from app.ml.anomaly_detection import AnomalyDetector

anomaly_bp = Blueprint('anomaly', __name__, url_prefix='/ml')

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Détection des Ruptures de Stock</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .plot-container { margin-bottom: 30px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .alert {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Détection des Ruptures de Stock Imminentes</h1>

        <div class="plot-container">
            <h2>Visualisation des Anomalies</h2>
            <img src="data:image/png;base64,{{ plot_image }}" 
                 alt="Anomaly Detection Plot" 
                 style="max-width: 100%;">
        </div>

        {% if critical_products %}
        <div class="critical-products">
            <h2 class="alert">⚠️ Produits en Rupture Critique ({{ total_anomalies }})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Entrepôt</th>
                        <th>Stock Actuel</th>
                        <th>Seuil Critique</th>
                        <th>Déficit</th>
                    </tr>
                </thead>
                <tbody>
                    {% for product in critical_products %}
                    <tr>
                        <td>{{ product.Product_Name }}</td>
                        <td>{{ product.Warehouse_Name }}</td>
                        <td>{{ product.rest_quantity|int }}</td>
                        <td>{{ product.seuil_critique|int }}</td>
                        <td>{{ (product.seuil_critique - product.rest_quantity)|int }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% else %}
        <p>Aucun produit en rupture critique détecté.</p>
        {% endif %}
    </div>
</body>
</html>
"""

@anomaly_bp.route('/anomalies', methods=['GET'])
def detect_anomalies():
    detector = AnomalyDetector()
    report = detector.get_anomaly_report()
    
    if 'error' in report:
        return jsonify(report), 400
    
    return render_template_string(
        HTML_TEMPLATE,
        plot_image=report['plot_image'],
        critical_products=report['critical_products'],
        total_anomalies=report['total_anomalies']
    )