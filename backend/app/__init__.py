from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
from flask_jwt_extended import JWTManager

# 🔥 Importer uniquement marketing_bp
from .routes.marketing_routes import marketing_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    # app.register_blueprint(fiabilite_bp) # Supprimer ou commenter cette ligne

    # Connection config
    server = "DESKTOP-CAV7GGJ\\MSSQLSERVERRR"
    database = "DW_FINALE"
    driver = "ODBC Driver 17 for SQL Server"

    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)
    app.config['MONGO_URI'] = "mongodb+srv://Emma:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'

    # Register routes
    from .routes.sales_routes import init_sales_routes
    init_sales_routes(app)

    from .routes.user_routes import init_user_routes
    init_user_routes(app)


    # ✅ Enregistrer marketing_bp
    app.register_blueprint(marketing_bp)

    jwt = JWTManager(app)

    return app