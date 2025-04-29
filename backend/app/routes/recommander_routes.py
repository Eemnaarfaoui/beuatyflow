# routes/recommander_routes.py
from flask import Blueprint, jsonify
from backend.app.ml.recommender import Recommender
from flask import Blueprint, jsonify, g


recommander_bp = Blueprint('recommander', __name__, url_prefix='/recommandations')

# Initialiser l'objet Recommender (à configurer avec vos informations de connexion)
recommender = Recommender(
    server='FATMA_ZINE\\FATMAZINE',
    database='DW_SupplyChain',
    driver='ODBC Driver 17 for SQL Server'
)

recommander_bp = Blueprint('recommander', __name__, url_prefix='/recommandations')

@recommander_bp.route('/utilisateur/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    recommendations_df = g.recommender.get_recommendations_for_user(user_id)
    recommendations = recommendations_df.to_dict(orient='records')
    return jsonify(recommendations)

@recommander_bp.route('/utilisateur/<int:user_id>/budget', methods=['GET'])
def get_user_budget_route(user_id):
    budget = g.recommender.get_user_budget(user_id)
    if budget:
        return jsonify({'user_id': user_id, 'budget': budget})
    return jsonify({'message': 'Utilisateur non trouvé'}), 404

@recommander_bp.route('/utilisateur/<int:user_id>/cluster', methods=['GET'])
def get_user_cluster_route(user_id):
    cluster = g.recommender.get_user_preference_cluster(user_id)
    if cluster is not None:
        return jsonify({'user_id': user_id, 'preference_cluster': int(cluster)})  # Convertir en int Python natif
    return jsonify({'message': 'Utilisateur non trouvé'}), 404
@recommander_bp.route('/clusters/profils', methods=['GET'])
def get_cluster_profiles_route():
    profiles = g.recommender.get_cluster_profiles()
    return jsonify(profiles)