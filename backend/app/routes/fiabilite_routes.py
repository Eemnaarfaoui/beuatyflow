# backend/app/routes/fiabilite_routes.py
from ..ml.fiabilite import classify_supplier_reliability, load_supplier_data, predict_future_purchase, train_purchase_prediction_model
from flask import Blueprint, jsonify, request, current_app
import pyodbc
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

@ml_bp.route('/supplierReliabilityData', methods=['GET'])
def supplier_reliability_data():
    df = load_supplier_data()
    if df.empty:
        return jsonify([]) # retourne une liste vide si aucune donnée
    df['Date_Dernier_Achat'] = pd.to_datetime(df['Date_Dernier_Achat'])
    df['Recence_Dernier_Achat'] = (datetime.now() - df['Date_Dernier_Achat']).dt.days
    reliability_df = classify_supplier_reliability(df)
    return jsonify(reliability_df.to_dict(orient='records'))

@ml_bp.route('/supplierReliabilityChart', methods=['GET'])
def supplier_reliability_chart():
    df = load_supplier_data()
    if df.empty:
        return jsonify({"labels": [], "data": []})
    df['Date_Dernier_Achat'] = pd.to_datetime(df['Date_Dernier_Achat'])
    df['Recence_Dernier_Achat'] = (datetime.now() - df['Date_Dernier_Achat']).dt.days
    reliability_df = classify_supplier_reliability(df)

    # Compter le nombre de fournisseurs par catégorie
    category_counts = reliability_df['Reliability_Category'].value_counts().sort_index()
    return jsonify({
        "labels": [str(label) for label in category_counts.index],
        "data": [int(value) for value in category_counts.values]
})




def get_db_connection_sa():
    server = current_app.config['SERVER']
    database = current_app.config['STAGING_AREA']  # Connect to SA_Supply_Chain
    driver = '{' + current_app.config['DRIVER'] + '}'
    conn_str = (
        f'DRIVER={driver};'
        f'SERVER={server};'
        f'DATABASE={database};'
        f'Trusted_Connection=yes;'  # Assuming Windows Authentication
    )
    try:
        cnxn = pyodbc.connect(conn_str)
        return cnxn
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"Database Connection Error (SA): {sqlstate}")
        return None

def add_supplier_sa(supplierid, suppliername, contact, email, address, city, country, id_geo):
    cnxn = get_db_connection_sa()
    if cnxn:
        try:
            cursor = cnxn.cursor()
            sql = """
                INSERT INTO SA_Supply_Chain.dbo.Suppliers_SA (supplierid, suppliername, contact, email, address, city, country, id_geo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, supplierid, suppliername, contact, email, address, city, country, id_geo)
            cnxn.commit()
        except Exception as e:
            cnxn.rollback()
            print(f"Error adding supplier (SA): {e}")  # Log the error
            raise  # Re-raise the exception to be caught by the route
        finally:
            if cnxn:
                cnxn.close()
    else:
        raise Exception("Failed to connect to the SA_Supply_Chain database")

@ml_bp.route('/suppliers', methods=['POST'])
def add_supplier():
    try:
        data = request.get_json()
        required_fields = ["supplierid", "suppliername", "contact", "email", "address", "city", "country", "id_geo"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field {field}"}), 400

        add_supplier_sa(
            supplierid=data["supplierid"],
            suppliername=data["suppliername"],
            contact=data["contact"],
            email=data["email"],
            address=data["address"],
            city=data["city"],
            country=data["country"],
            id_geo=data["id_geo"]
        )

        return jsonify({"message": "Supplier created successfully."}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500