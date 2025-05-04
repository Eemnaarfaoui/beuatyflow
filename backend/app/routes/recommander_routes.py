# routes/recommander_routes.py
from flask import Blueprint, jsonify, request, g

recommander_bp = Blueprint('recommander', __name__, url_prefix='/recommandations')

@recommander_bp.route('/chat/<int:user_id>/start', methods=['GET'])
def start_chat(user_id):
    """Starts a new chat session with the chatbot for a given user."""
    response = g.recommender.start_chat(user_id)
    return jsonify({'response': response})

@recommander_bp.route('/chat/<int:user_id>/message', methods=['POST'])
def handle_chat_message(user_id):
    """Handles a message from the user in the chat."""
    message = request.get_json()['message']
    response = g.recommender.handle_message(message)
    return jsonify({'response': response})

@recommander_bp.route('/chat/<int:user_id>/preferences', methods=['GET'])
def get_user_preferences(user_id):
    """Retrieves the user's preferences collected during the chat."""
    preferences = g.recommender.get_preferences()
    return jsonify(preferences)


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
        return jsonify({'user_id': user_id, 'preference_cluster': int(cluster)})
    return jsonify({'message': 'Utilisateur non trouvé'}), 404

@recommander_bp.route('/clusters/profils', methods=['GET'])
def get_cluster_profiles_route():
    profiles = g.recommender.get_cluster_profiles()
    return jsonify(profiles)