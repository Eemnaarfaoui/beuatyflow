from flask import Blueprint, jsonify, current_app, request
from sqlalchemy import text
from flask_cors import CORS
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

# Blueprint pour les routes des entrepôts
warehouse_routes = Blueprint('warehouse_routes', __name__)

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

# Initialiser les routes des entrepôts avec l'application Flask
def init_warehouse_routes(app):
    # Enregistrer le blueprint avec l'application Flask
    app.register_blueprint(warehouse_routes)
    # Activer CORS pour permettre les requêtes inter-domaines
    CORS(app)

# Route pour obtenir les données des entrepôts avec options de filtrage et de pagination
@warehouse_routes.route('/warehouses', methods=['GET'])
def get_warehouses():
    try:
        connection = get_db_connection()

        # Récupérer les paramètres de filtrage et de pagination
        location_filter = request.args.get('location', default='', type=str)
        city_filter = request.args.get('city', default='', type=str)
        country_filter = request.args.get('country', default='', type=str)
        limit = request.args.get('limit', default=10, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Requête SQL pour récupérer les données des entrepôts, avec les filtres appliqués
        query = """
        SELECT
              [warehousename],
              [location],
              [capacity],
              [city],
              [country]
        FROM [SA_Supply_Chain].[dbo].[Warehouses_SA]
        WHERE ([location] LIKE :location OR :location = '')
          AND ([city] LIKE :city OR :city = '')
          AND ([country] LIKE :country OR :country = '')
        ORDER BY [warehousename]  -- Vous pouvez ajuster l'ordre selon votre besoin
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY;
        """
        
        # Exécution de la requête SQL avec les filtres et pagination
        with connection.connect() as conn:
            result = conn.execute(text(query), {
                'location': f'%{location_filter}%', 
                'city': f'%{city_filter}%',
                'country': f'%{country_filter}%',
                'limit': limit,
                'offset': offset
            })
            rows = result.fetchall()
            column_names = result.keys()
            warehouse_data = [dict(zip(column_names, row)) for row in rows]
        
        return jsonify(warehouse_data)
    
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des données des entrepôts : {str(e)}")
        return jsonify({"error": f"Erreur lors de la récupération des entrepôts: {str(e)}"}), 500

# Route pour ajouter un nouvel entrepôt
@warehouse_routes.route('/warehouses', methods=['POST'])
def add_warehouse():
    try:
        # Récupérer les données envoyées dans la requête
        data = request.get_json()
        
        # Extraire les informations nécessaires du corps de la requête
        warehousename = data.get('warehousename')
        location = data.get('location')
        capacity = data.get('capacity')
        id_geo = data.get('id_geo')
        city = data.get('city')
        country = data.get('country')
        
        # Requête SQL d'insertion
        query = """
        INSERT INTO [SA_Supply_Chain].[dbo].[Warehouses_SA]
        ([warehousename], [location], [capacity], [id_geo], [city], [country])
        VALUES
        (:warehousename, :location, :capacity, :id_geo, :city, :country)
        """
        
        connection = get_db_connection()
        
        # Exécution de la requête d'insertion avec les données récupérées
        with connection.connect() as conn:
            conn.execute(text(query), {
                'warehousename': warehousename,
                'location': location,
                'capacity': capacity,
                'id_geo': id_geo,
                'city': city,
                'country': country
            })
        
        return jsonify({"message": "Entrepôt ajouté avec succès"}), 201
    
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de l'entrepôt : {str(e)}")
        return jsonify({"error": f"Erreur lors de l'ajout de l'entrepôt: {str(e)}"}), 500

# Route pour mettre à jour un entrepôt existant
@warehouse_routes.route('/warehouses/<int:warehouseid>', methods=['PUT'])
def update_warehouse(warehouseid):
    try:
        # Récupérer les données envoyées dans la requête
        data = request.get_json()
        
        # Extraire les informations nécessaires du corps de la requête
        warehousename = data.get('warehousename')
        location = data.get('location')
        capacity = data.get('capacity')
        id_geo = data.get('id_geo')
        city = data.get('city')
        country = data.get('country')
        
        # Requête SQL de mise à jour
        query = """
        UPDATE [SA_Supply_Chain].[dbo].[Warehouses_SA]
        SET
            [warehousename] = :warehousename,
            [location] = :location,
            [capacity] = :capacity,
            [id_geo] = :id_geo,
            [city] = :city,
            [country] = :country
        WHERE [warehouseid] = :warehouseid
        """
        
        connection = get_db_connection()
        
        # Exécution de la requête de mise à jour avec les données récupérées
        with connection.connect() as conn:
            conn.execute(text(query), {
                'warehouseid': warehouseid,
                'warehousename': warehousename,
                'location': location,
                'capacity': capacity,
                'id_geo': id_geo,
                'city': city,
                'country': country
            })
        
        return jsonify({"message": "Entrepôt mis à jour avec succès"}), 200
    
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'entrepôt : {str(e)}")
        return jsonify({"error": f"Erreur lors de la mise à jour de l'entrepôt: {str(e)}"}), 500

# Route pour supprimer un entrepôt
@warehouse_routes.route('/warehouses/<int:warehouseid>', methods=['DELETE'])
def delete_warehouse(warehouseid):
    try:
        # Requête SQL de suppression
        query = """
        DELETE FROM [SA_Supply_Chain].[dbo].[Warehouses_SA]
        WHERE [warehouseid] = :warehouseid
        """
        
        connection = get_db_connection()
        
        # Exécution de la requête de suppression
        with connection.connect() as conn:
            conn.execute(text(query), {'warehouseid': warehouseid})
        
        return jsonify({"message": "Entrepôt supprimé avec succès"}), 200
    
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'entrepôt : {str(e)}")
        return jsonify({"error": f"Erreur lors de la suppression de l'entrepôt: {str(e)}"}), 500
