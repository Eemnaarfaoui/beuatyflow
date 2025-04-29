from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
import dns.resolver
import os
from .ml.recommender import Recommender
from .routes.recommander_routes import recommander_bp
from .routes.fiabilite_routes import ml_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(ml_bp)
    app.register_blueprint(recommander_bp)

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

 # Connection config
    server = r"FATMA_ZINE\FATMAZINE"
    database = "DW_SupplyChain"
    driver = "ODBC Driver 17 for SQL Server"

    # SQLAlchemy engine
    connection_str = f"mssql+pyodbc://{server}/{database}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    app.config['SQL_ENGINE'] = create_engine(connection_str)
    app.config['MONGO_URI'] = "mongodb+srv://Emna:1011@beautyflow.cpfshru.mongodb.net/"
    app.config['JWT_SECRET_KEY'] = 'super-secret-key'


    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)