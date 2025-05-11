from flask import Blueprint, Response, current_app, jsonify, request
import matplotlib.pyplot as plt
import io
from sqlalchemy import text

customer_preferences_bp = Blueprint('customer_preferences_bp', __name__, url_prefix='/api/preferences')


@customer_preferences_bp.route('/visual/', methods=['GET'])
def preference_chart():
    try:
        budget_filter = request.args.getlist('budget')  # Ex: ["50 - 100 TND", "Plus de 200 TND"]
        engine = current_app.config['SQL_ENGINE']
        with engine.connect() as connection:
            query = "SELECT budget, COUNT(*) as count FROM dim_rec"
            if budget_filter:
                placeholders = ', '.join(f"'{val}'" for val in budget_filter)
                query += f" WHERE budget IN ({placeholders})"
            query += " GROUP BY budget"
            result = connection.execute(text(query))
            data = result.fetchall()

        labels = [row[0] for row in data]
        counts = [row[1] for row in data]

        fig, ax = plt.subplots(figsize=(10, 6))
        ax.bar(labels, counts, color='skyblue')
        ax.set_title("Customer Preferences by Budget")
        ax.set_ylabel("Number of Clients")
        ax.set_xlabel("Budget Category")
        plt.xticks(rotation=45)
        plt.tight_layout()

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        return Response(img.getvalue(), mimetype='image/png')

    except Exception as e:
        print(f"Error generating chart: {e}")
        return {"error": str(e)}, 500


@customer_preferences_bp.route('/stats', methods=['GET'])
def get_preferences_stats():
    try:
        budget_filter = request.args.getlist('budget')
        engine = current_app.config['SQL_ENGINE']
        with engine.connect() as connection:
            base_query = "FROM dim_rec"
            if budget_filter:
                placeholders = ', '.join(f"'{val}'" for val in budget_filter)
                base_query += f" WHERE budget IN ({placeholders})"

            total = connection.execute(text(f"SELECT COUNT(*) {base_query}")).scalar()

            budget_rows = connection.execute(
                text(f"SELECT budget, COUNT(*) as count {base_query} GROUP BY budget")
            ).fetchall()

            pref_rows = connection.execute(
                text(f"SELECT preference_cos, COUNT(*) as count {base_query} GROUP BY preference_cos")
            ).fetchall()

            by_budget = [{'budget': row[0], 'count': row[1]} for row in budget_rows]
            by_preference_cos = [{'preference_cos': row[0], 'count': row[1]} for row in pref_rows]

        return jsonify({
            'total_clients': total,
            'by_budget': by_budget,
            'by_preference_cos': by_preference_cos
        })

    except Exception as e:
        print(f"Error fetching statistics: {e}")
        return {'error': str(e)}, 500
