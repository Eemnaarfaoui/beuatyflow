from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
import dns.resolver  # Pour éviter certaines erreurs MongoDB Atlas

def create_app():
    app = Flask(__name__)
    CORS(app)

    # --- Configurations SQL Server ---
    server = "localhost"
    database = "DW_SupplyChain"
    driver = "ODBC Driver 17 for SQL Server"
    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)

    # --- Configurations MongoDB ---
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"

    # --- Config JWT ---
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'
    jwt = JWTManager(app)


    # Importations dans une try-except
    try:
        from app.routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/users')
    except ImportError as e:
        print(f"⚠️ Erreur lors de l'import de user_bp: {e}")

    try:
        from app.routes.sales_routes import sales_bp
        app.register_blueprint(sales_bp, url_prefix='/sales')
    except ImportError as e:
        print(f"⚠️ Erreur lors de l'import de sales_bp: {e}")

    # Importation sûre de ton forecast
    from app.routes.forecast_routes import forecast_bp
    app.register_blueprint(forecast_bp, url_prefix='/ml')




    return app
