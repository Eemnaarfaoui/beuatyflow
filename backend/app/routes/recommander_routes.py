from flask import Blueprint, jsonify, request, g, session

recommender_bp = Blueprint('recommender', __name__)

@recommender_bp.route('/chat/start', methods=['GET'])
def start_chat():
    session['current_step_index'] = 0
    session['user_preferences'] = {}
    session.modified = True  # Assure que la session est bien mise à jour
    response = g.recommender.start_chat()
    return jsonify({'response': response})


@recommender_bp.route("/chat/message", methods=["POST"])
def handle_chat_message():
    data = request.json
    message = data.get("message")
    current_step_index = data.get("current_step_index", 0)
    user_preferences = data.get("user_preferences", {})

    print(f"🔄 Received message: {message}")
    print(f"📍 Current step index BEFORE processing: {current_step_index}")

    response, next_step_index, updated_preferences = g.recommender.handle_message(
        message, current_step_index, user_preferences
    )

    print(f"➡️ New step index AFTER processing: {next_step_index}")

    return jsonify({
        "response": response,
        "next_step_index": next_step_index,
        "user_preferences": updated_preferences,
    })
@recommender_bp.route('/get_options/<question_id>', methods=['GET'])
def get_options(question_id):
    options = g.recommender.get_question_answers(int(question_id))
    if options:
        return jsonify({'options': options})
    return jsonify({'error': 'Question non trouvée'}), 404
