from flask import Blueprint, request, jsonify
from app.ml.prophet_model import train_forecast_supplier
from flask import render_template_string
import time

forecast_bp = Blueprint('forecast', __name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Prévisions des Fournisseurs</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { display: flex; flex-wrap: wrap; gap: 30px; }
        .forecast-card { 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            padding: 15px; 
            width: 45%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .forecast-image { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { color: #333; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Prévisions des Prix des Fournisseurs</h1>
    <div class="container">
        {% for result in results %}
        <div class="forecast-card">
            <h2>{{ result.supplier }}</h2>
            {% if result.status == "success" %}
                <img class="forecast-image" src="data:image/png;base64,{{ result.plot_image }}" alt="Forecast">
                <h3>Dernières Prévisions:</h3>
                <table>
                    <tr>
                        <th>Date</th>
                        <th>Prix (TND)</th>
                    </tr>
                    {% for item in result.forecast_data %}
                    <tr>
                        <td>{{ item.ds.strftime('%Y-%m-%d') }}</td>
                        <td>{{ "%.2f"|format(item.yhat) }}</td>
                    </tr>
                    {% endfor %}
                </table>
            {% else %}
                <p class="error">{{ result.error }}</p>
            {% endif %}
        </div>
        {% endfor %}
    </div>
</body>
</html>
"""

@forecast_bp.route('/forecast', methods=['GET'])
def forecast():
    suppliers = request.args.getlist('supplier')
    if not suppliers:
        return jsonify({'error': 'Au moins un fournisseur est requis'}), 400
    
    results = []
    for supplier in suppliers:
        try:
            result = train_forecast_supplier(supplier)
            results.append(result)
        except ValueError as e:
            results.append({
                "supplier": supplier,
                "status": "error",
                "error": str(e)
            })
        except Exception as e:
            results.append({
                "supplier": supplier,
                "status": "error",
                "error": f"Erreur interne: {str(e)}"
            })
    
    return render_template_string(HTML_TEMPLATE, results=results)