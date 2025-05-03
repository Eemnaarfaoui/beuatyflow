# backend/app/__init__.py
from flask import Flask
from .routes.marketing_routes import marketing_bp

# Importez d'autres blueprints si vous en avez
# from .routes.fiabilite_routes import fiabilite_bp
# from .routes.sales_routes import sales_bp
# from .routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)

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