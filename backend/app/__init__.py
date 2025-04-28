from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Connection config
    server = r"FATMA_ZINE\FATMAZINE"
    database = "DW_SupplyChain"
    driver = "ODBC Driver 17 for SQL Server"

    # SQLAlchemy engine
    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'
    # Register routes
    from .routes.sales_routes import init_sales_routes
    init_sales_routes(app)

    from .routes.user_routes import init_user_routes
    init_user_routes(app)

    try:
        print(f"Current directory: {os.getcwd()}")
        print(f"Files in current directory: {os.listdir('.')}")
        from .routes.fiabilite_routes import ml_bp, api_bp
        app.register_blueprint(ml_bp)
        app.register_blueprint(api_bp)
    except ImportError as e:
        print(f"Error importing fiabilite_routes: {e}")

    from flask_jwt_extended import JWTManager
    jwt = JWTManager(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)