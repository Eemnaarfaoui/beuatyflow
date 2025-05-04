# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from .routes.marketing_routes import marketing_bp



def create_app():
    app = Flask(__name__)
    CORS(app)
    # Enregistrez les blueprints
    app.register_blueprint(marketing_bp)
    # app.register_blueprint(fiabilite_bp)
    # app.register_blueprint(sales_bp)
    # app.register_blueprint(user_bp)

    @app.route('/')
    def index():
        return "Bienvenue sur l'API BeautyFlow!"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)