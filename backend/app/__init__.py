# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from flask_jwt_extended import JWTManager
from .config import Config
from .ml.recommender import Recommender
from .routes.recommander_routes import recommander_bp
from .routes.fiabilite_routes import ml_bp
from .routes.sales_routes import init_sales_routes
from .routes.user_routes import init_user_routes
from .routes.inventory_routes import init_inventory_routes
from .routes.warehouse_routes import init_warehouse_routes

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/ml/*": {"origins": "http://localhost:4200"}})
    app.register_blueprint(ml_bp, url_prefix='/ml')
    app.register_blueprint(recommander_bp)

    # Connection config
    app.config.from_object(Config)

    # SQLAlchemy engine (for DW_SupplyChain)
    connection_str_dw = f"mssql+pyodbc://{app.config['SERVER']}/{app.config['DATAWAREHOUSE']}?trusted_connection=yes&driver={app.config['DRIVER'].replace(' ', '+')}"
    app.config['SQL_ENGINE_DW'] = create_engine(connection_str_dw)
    # SQLAlchemy engine (for SA_Supply_Chain - you might not need this here if pyodbc is used directly)
    connection_str_sa = f"mssql+pyodbc://{app.config['SERVER']}/{app.config['STAGING_AREA']}?trusted_connection=yes&driver={app.config['DRIVER'].replace(' ', '+')}"
    app.config['SQL_ENGINE_SA'] = create_engine(connection_str_sa)

    # Configuration de JWT
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token will NEVER expire

    # Register routes
    init_sales_routes(app)
    init_user_routes(app)
    init_inventory_routes(app)
    init_warehouse_routes(app)

    # Configuration de JWT
    jwt = JWTManager(app)
    @app.before_request
    def before_request():
        from flask import g
        g.recommender = Recommender(
            server=app.config['SERVER'],
            database=app.config['DATAWAREHOUSE'],
            driver=app.config['DRIVER']
        )
    @app.teardown_appcontext
    def shutdown_recommender(error=None):
        from flask import g
        if hasattr(g, 'recommender'):
            g.recommender.close_connection()
            if error:
                print(f"Erreur lors de la fermeture de la connexion : {error}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)