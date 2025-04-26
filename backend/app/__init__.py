from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Connection config
    server = "localhost"
    database = "DW_SupplyChain"
    driver = "ODBC Driver 17 for SQL Server"

    # SQLAlchemy engine
    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token will NEVER expire
    # Register routes
    from .routes.sales_routes import init_sales_routes
    init_sales_routes(app)
 
    from .routes.user_routes import init_user_routes
    init_user_routes(app)

    from flask_jwt_extended import JWTManager
    jwt = JWTManager(app)

    return app
