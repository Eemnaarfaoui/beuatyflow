from flask import Blueprint, jsonify, current_app, request
from sqlalchemy import text
from flask_cors import CORS
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

# Blueprint pour les routes d'inventaire
inventory_routes = Blueprint('inventory_routes', __name__)

# Fonction pour récupérer la connexion à la base de données depuis l'application Flask
def get_db_connection():
    try:
        # Récupérer la connexion SQLAlchemy configurée dans app.config
        engine = current_app.config['SQL_ENGINE']
        return engine
    except Exception as e:
        # Si la connexion échoue, loguer l'erreur
        logger.error(f"Erreur de connexion à la base de données: {e}")
        raise

# Initialiser les routes d'inventaire avec l'application Flask
def init_inventory_routes(app):
    # Enregistrer le blueprint avec l'application Flask
    app.register_blueprint(inventory_routes)
    # Activer CORS pour permettre les requêtes inter-domaines
    CORS(app)

# Route pour obtenir les données d'inventaire
@inventory_routes.route('/inventory', methods=['GET'])
def get_inventory():
    try:
        connection = get_db_connection()
        
        # Requête SQL pour récupérer les données de la table Inventory_SA et la table Products_SA
        query = """
        SELECT TOP 1000 
        [Warehouse_ID],
        [Warehouse_Name],
        [Location],
        [Product_ID],
        [Quantity],
        [productname]
        FROM [SA_Supply_Chain].[dbo].[Inventory_SA] 
        LEFT JOIN [SA_Supply_Chain].[dbo].[Products_SA] 
        ON [SA_Supply_Chain].[dbo].[Inventory_SA].[Product_ID] = [SA_Supply_Chain].[dbo].[Products_SA].[productid]
        """

        # Exécution de la requête SQL
        with connection.connect() as conn:
            result = conn.execute(text(query))
            rows = result.fetchall()
            column_names = result.keys()
            inventory_data = [dict(zip(column_names, row)) for row in rows]

        return jsonify(inventory_data)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des données : {str(e)}")
        return jsonify({"error": f"Erreur lors de la récupération des données: {str(e)}"}), 500


# Route pour ajouter un élément d'inventaire (insertion)
@inventory_routes.route('/inventory', methods=['POST'])
def add_inventory():
    try:
        # Récupérer les données JSON envoyées dans la requête POST
        data = request.get_json()

        # Vérifier que toutes les informations nécessaires sont présentes
        required_fields = ['Warehouse_Name', 'Location', 'Product_ID', 'Quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Le champ '{field}' est manquant."}), 400

        # Connexion à la base de données via SQLAlchemy
        connection = get_db_connection()

        # Requête SQL pour insérer un nouvel enregistrement dans la table Inventory_SA
        query = """
        INSERT INTO [SA_Supply_Chain].[dbo].[Inventory_SA] 
        ([Warehouse_Name], [Location], [Product_ID], [Quantity]) 
        VALUES (:Warehouse_Name, :Location, :Product_ID, :Quantity)
        """

        # Exécution de la requête d'insertion avec les données
        with connection.connect() as conn:
            conn.execute(text(query), **data)

        # Retourner une réponse indiquant que l'insertion a réussi
        return jsonify({"message": "Données ajoutées avec succès!"}), 201

    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de l'inventaire : {str(e)}")
        return jsonify({"error": f"Erreur lors de l'ajout de l'inventaire : {str(e)}"}), 500
