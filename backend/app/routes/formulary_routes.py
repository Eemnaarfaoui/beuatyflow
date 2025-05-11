from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import text

formulary_bp = Blueprint('formulary_bp', __name__)

@formulary_bp.route('/api/formulary', methods=['POST'])
def receive_formulary():
    data = request.get_json()
    try:
        print("🔍 Données reçues :", data)

        engine = current_app.config['SQL_ENGINE']

        # begin() gère commit/rollback automatiquement
        with engine.begin() as connection:
            insert_query = text("""
                INSERT INTO dim_rec (
                    interet_rec, objectif_cos, probleme_peau,
                    preference_cos, type_peau, type_cheveux,
                    budget, frequence_app
                ) VALUES (
                    :interet_rec, :objectif_cos, :probleme_peau,
                    :preference_cos, :type_peau, :type_cheveux,
                    :budget, :frequence_app
                )
            """)
            connection.execute(insert_query, data)

        return jsonify({"message": "✅ Formulaire inséré dans dim_rec"}), 201

    except Exception as e:
        print(f"❌ Erreur API : {e}")
        return jsonify({"error": str(e)}), 500
