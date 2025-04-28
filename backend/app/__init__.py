from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    CORS(app)  # Cela permet de résoudre les problèmes CORS pendant le développement.

    # Configuration de la connexion à la base de données
    server = "CHAYMA_BOUBAKRI\BI"
    database_DW = "DW_Supply_Chain"
    database = "SA_Supply_Chain"
    driver = "ODBC Driver 17 for SQL Server"

    # Configuration de la connexion SQLAlchemy
    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"

    app.config['SQL_ENGINE'] = create_engine(connection_str)

    # Configuration de MongoDB et du secret JWT
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'

    # Enregistrement des routes
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

    return app
