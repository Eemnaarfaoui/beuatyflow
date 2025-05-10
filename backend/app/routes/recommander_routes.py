# backend/recommender_api.py
from flask import Blueprint, jsonify, request, session, current_app

from flask_cors import CORS
import pandas as pd

from ..ml.recommender import Recommender

recommender_bp = Blueprint('recommender', __name__)
CORS(recommender_bp)

# Instancier le Recommender au niveau de l'application
recommender_instance = None

@recommender_bp.before_app_request
def initialize_recommender():
    global recommender_instance
    if recommender_instance is None:
        recommender_instance = Recommender(
            server=current_app.config['SERVER'],
            database=current_app.config['DATAWAREHOUSE'],
            driver=current_app.config['DRIVER']
        )

@recommender_bp.route('/chat/start', methods=['GET'])
def start_chat():
    session['user_preferences'] = {}
    session['current_step_index'] = 0
    return jsonify({'response': recommender_instance.questions[0]})

@recommender_bp.route('/chat/message', methods=['POST'])
def handle_chat_message():
    print(f"*** DÉBUT handle_chat_message - Étape actuelle dans la session : {session.get('current_step_index')}")
    if 'user_preferences' not in session:
        session['user_preferences'] = {}
    if 'current_step_index' not in session:
        session['current_step_index'] = 0

    message = request.get_json()['message']
    print(f"Message reçu : {message}")

    response, next_step_index, updated_preferences = recommender_instance.handle_message(
        message, session['current_step_index'], session['user_preferences']
    )

    session['user_preferences'] = updated_preferences
    session['current_step_index'] = next_step_index
    print(f"Étape suivante : {session['current_step_index']}")
    print(f"Nombre total de questions : {len(recommender_instance.questions)}")

    if isinstance(response, pd.DataFrame):
        recommendations_data = response.to_dict('records')
        return jsonify({'recommendations': recommendations_data})
    else:
        return jsonify({'response': response})

@recommender_bp.route('/clusters/profils', methods=['GET'])
def get_cluster_profiles_route():
    # La fonction get_cluster_profiles n'est plus dans la classe Recommender
    profiles = {}
    return jsonify(profiles)