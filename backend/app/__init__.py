from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
from flask_jwt_extended import JWTManager
from .config import Config
from flask import Flask
from sqlalchemy import create_engine
import os
from .ml.recommender import Recommender
from .routes.recommander_routes import recommander_bp
from .routes.fiabilite_routes import ml_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Cela permet de résoudre les problèmes CORS pendant le développement.
    app.register_blueprint(ml_bp)
    app.register_blueprint(recommander_bp)

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

    from .routes.inventory_routes import init_inventory_routes
    init_inventory_routes(app)

    # Ajouter les routes des entrepôts
    from .routes.warehouse_routes import init_warehouse_routes
    init_warehouse_routes(app)

    # Configuration de JWT
    jwt = JWTManager(app)
    @app.before_request
    def before_request():
        from flask import g
        g.recommender = Recommender(
            server='FATMA_ZINE\\FATMAZINE',
            database='DW_SupplyChain',
            driver='ODBC Driver 17 for SQL Server'
        )
    @app.teardown_appcontext
    def shutdown_recommender(error=None):
        from flask import g
        if hasattr(g, 'recommender'):
            g.recommender.close_connection()
            if error:
                print(f"Erreur lors de la fermeture de la connexion : {error}")

    return app
