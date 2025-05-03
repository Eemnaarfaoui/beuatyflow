from flask import Blueprint, request, jsonify
from app.ml.prophet_model import train_forecast_supplier

forecast_bp = Blueprint('forecast', __name__, url_prefix='/ml')

@forecast_bp.route('/forecast', methods=['GET'])
def forecast():
    suppliers = request.args.getlist('supplier')
    if not suppliers:
        return jsonify({'error': 'At least one supplier is required'}), 400
    
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
                "error": f"Internal error: {str(e)}"
            })
    
    return jsonify(results)