# recommendation_bp.py
from flask import Blueprint, jsonify, render_template_string
from app.ml.supplier_recommender import SupplierRecommender

recommendation_bp = Blueprint('recommendation', __name__, url_prefix='/ml')

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Recommandation Fournisseurs</title>
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
        .highlight {
            background-color: #e6f7ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Recommandation de Fournisseurs par Produit</h1>

        <div class="stats">
            <p>Produits analysés: {{ analyzed_products }}/{{ total_products }}</p>
        </div>

        <div class="plot-container">
            <h2>Visualisation des Recommandations</h2>
            <img src="data:image/png;base64,{{ plot_image }}" 
                 alt="Supplier Recommendation Plot" 
                 style="max-width: 100%;">
            <p>Note: Les scores vont de 0 (peu recommandé) à 1 (fortement recommandé)</p>
        </div>

        {% if recommendations %}
        <div class="recommendations">
            <h2>Meilleur Fournisseur par Produit</h2>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Fournisseur</th>
                        <th>Score</th>
                        <th>Prix Moyen</th>
                        <th>Quantité Totale</th>
                    </tr>
                </thead>
                <tbody>
                    {% for rec in recommendations %}
                    <tr {% if loop.first %}class="highlight"{% endif %}>
                        <td>{{ rec.Produit }}</td>
                        <td>{{ rec.Fournisseur }}</td>
                        <td>{{ "%.2f"|format(rec.Score) }}</td>
                        <td>{{ "%.2f"|format(rec.Prix_moyen) }}</td>
                        <td>{{ rec.Quantite|int }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% else %}
        <p>Aucune recommandation disponible.</p>
        {% endif %}
    </div>
</body>
</html>
"""

@recommendation_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    recommender = SupplierRecommender()
    report = recommender.get_recommendation_report()
    
    if 'error' in report:
        return jsonify(report), 400
    
    return render_template_string(
        HTML_TEMPLATE,
        plot_image=report['plot_image'],
        recommendations=report['recommendations'],
        total_products=report['total_products'],
        analyzed_products=report['analyzed_products']
    )
