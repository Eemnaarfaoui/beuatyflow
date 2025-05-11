from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
from flask_jwt_extended import JWTManager

from .ml.recommender import Recommender
from .config import Config

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config['SECRET_KEY'] = 'BeautyFlow'  # Clé secrète pour les sessions Flask


    # Connection config
    app.config.from_object(Config)
    
    # SQLAlchemy engine
    connection_str = f"mssql+pyodbc://{app.config['SERVER']}/{app.config['DATAWAREHOUSE']}?trusted_connection=yes&driver={app.config['DRIVER'].replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)

    # Configuration de MongoDB et du secret JWT
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token will NEVER expire
    # Register routes
    from .routes.sales_routes import init_sales_routes
    init_sales_routes(app)

    from .routes.user_routes import init_user_routes
    init_user_routes(app)

    #from .routes.inventory_routes import init_inventory_routes
    #init_inventory_routes(app)

    # Ajouter les routes des entrepôts
    from .routes.warehouse_routes import init_storage_routes
    init_storage_routes(app)

    from app.routes.anomaly_routes import anomaly_bp
    app.register_blueprint(anomaly_bp)

    from app.routes.forecast_routes import forecast_bp
    app.register_blueprint(forecast_bp, url_prefix='/ml')

    from app.routes.recommendation_routes import recommendation_bp
    app.register_blueprint(recommendation_bp)

    from .routes.recommander_routes import recommender_bp
    app.register_blueprint(recommender_bp, url_prefix='/recommender')

 

    from .routes.fiabilite_routes import ml_bp
    app.register_blueprint(ml_bp)



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

