import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from datetime import datetime
import joblib
import logging
from flask import current_app
import os


# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chemin pour sauvegarder le modèle
BACKEND_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BACKEND_ROOT, 'models', 'purchase_prediction_model.joblib')
SCALER_PATH = os.path.join(BACKEND_ROOT, 'models', 'feature_scaler.joblib')


# Features pour la prédiction
FEATURES_PREDICTION = ['Frequence_Achat', 'Volume_Total_Quantite', 'Recence_Dernier_Achat', 'Diversite_Produits']
TARGET_PREDICTION = 'Volume_Total_Montant'

# Features pour le score de fiabilité
FEATURES_RELIABILITY = ['Frequence_Achat', 'Volume_Total_Quantite', 'Volume_Total_Montant', 'Recence_Dernier_Achat', 'Diversite_Produits']
WEIGHTS_RELIABILITY = {
    'Frequence_Achat': 0.2,
    'Volume_Total_Quantite': 0.25,
    'Volume_Total_Montant': 0.3,
    'Recence_Dernier_Achat': -0.15,
    'Diversite_Produits': 0.1
}
RELIABILITY_BINS = [0.0, 0.3, 0.7, 1.0]
RELIABILITY_LABELS = ['Peu fiable', 'Fiable', 'Très fiable']

# Configuration de la base de données
SERVER = "localhost"
DATABASE = "DW_SupplyChain"
DRIVER = "ODBC Driver 17 for SQL Server"
DRIVER_ENCODED = DRIVER.replace(" ", "+")
CONNECTION_STRING = f"mssql+pyodbc://{SERVER}/{DATABASE}?driver={DRIVER_ENCODED}"
engine = create_engine(CONNECTION_STRING)



def load_supplier_data():
    query_procurement = """
    SELECT
        fp.supplier_FK,
        COUNT(*) AS Frequence_Achat,
        SUM(fp.quantite) AS Volume_Total_Quantite,
        SUM(fp.quantite * fp.prix) AS Volume_Total_Montant,
        MAX(dd.FullDate) AS Date_Dernier_Achat,
        COUNT(DISTINCT fp.Product_FK) AS Diversite_Produits
    FROM
        [DW_SupplyChain].[dbo].[Fact_Procurement] fp
    INNER JOIN
        [DW_SupplyChain].[dbo].[Dim_Date] dd ON fp.Date_FK = dd.Date_PK
    WHERE
        dd.FullDate >= DATEADD(year, -1, GETDATE())
    GROUP BY
        fp.supplier_FK;
    """
    df = pd.read_sql(query_procurement, engine)
    return df

def preprocess_data(df):
    """Prétraite les données en calculant la récence et en gérant les valeurs manquantes."""
    if df.empty:
        return df
    df['Date_Dernier_Achat'] = pd.to_datetime(df['Date_Dernier_Achat'])
    df['Recence_Dernier_Achat'] = (datetime.now() - df['Date_Dernier_Achat']).dt.days
    df = df.dropna(subset=FEATURES_PREDICTION + [TARGET_PREDICTION], how='any')
    return df

def train_purchase_prediction_model():
    """Entraîne le modèle de prédiction du volume d'achat."""
    df = load_supplier_data()
    df_processed = preprocess_data(df.copy())

    if df_processed.empty or len(df_processed) < 2:
        logger.warning("Pas assez de données pour entraîner le modèle de prédiction.")
        return None

    X = df_processed[FEATURES_PREDICTION]
    y = df_processed[TARGET_PREDICTION]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)

    mse = mean_squared_error(y_test, model.predict(X_test))
    r2 = r2_score(y_test, model.predict(X_test))
    logger.info(f"Modèle de prédiction entraîné. MSE: {mse:.2f}, R^2: {r2:.2f}")

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    logger.info(f"Modèle de prédiction sauvegardé à {MODEL_PATH} et scaler à {SCALER_PATH}")
    return model, scaler

def load_purchase_prediction_model():
    """Charge le modèle de prédiction et le scaler."""
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        logger.info("Modèle de prédiction et scaler chargés avec succès.")
        return model, scaler
    except FileNotFoundError:
        logger.warning("Fichiers du modèle de prédiction ou du scaler non trouvés. Veuillez entraîner le modèle en premier.")
        return None, None

def predict_future_purchase(new_data):
    """Prédit le volume total d'achat futur pour de nouvelles données."""
    model, scaler = load_purchase_prediction_model()
    if model is None or scaler is None:
        return None

    try:
        input_df = pd.DataFrame([new_data])
        input_df['Date_Dernier_Achat'] = pd.to_datetime(input_df['Date_Dernier_Achat'])
        input_df['Recence_Dernier_Achat'] = (datetime.now() - input_df['Date_Dernier_Achat']).dt.days

        scaled_features = scaler.transform(input_df[FEATURES_PREDICTION])
        prediction = model.predict(scaled_features)[0]
        return prediction
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}", exc_info=True)
        return None

def calculate_reliability_score(df):
    """Calcule le score de fiabilité d'achat."""
    if df.empty:
        logger.warning("DataFrame vide pour le calcul du score de fiabilité.")
        return pd.DataFrame()

    df_scoring = df[FEATURES_RELIABILITY].copy()
    scaler = MinMaxScaler()
    df_scaled = scaler.fit_transform(df_scoring)
    df_scaled_df = pd.DataFrame(df_scaled, columns=FEATURES_RELIABILITY, index=df.index)

    df['Score_Fiabilite_Achat'] = 0
    for feature, weight in WEIGHTS_RELIABILITY.items():
        if feature in df_scaled_df.columns:
            df['Score_Fiabilite_Achat'] += df_scaled_df[feature] * weight
        else:
            logger.warning(f"La caractéristique '{feature}' n'est pas présente pour le calcul du score de fiabilité.")

    return df[['supplier_FK', 'Score_Fiabilite_Achat']]

def classify_supplier_reliability(df):
    """Classe les fournisseurs en catégories de fiabilité."""
    df_scored = calculate_reliability_score(df.copy())
    df_merged = pd.merge(df, df_scored, on='supplier_FK', how='inner')
    df_merged['Reliability_Category'] = pd.cut(df_merged['Score_Fiabilite_Achat'], bins=RELIABILITY_BINS, labels=RELIABILITY_LABELS, right=False, include_lowest=True)
    return df_merged[['supplier_FK', 'Reliability_Category', 'Score_Fiabilite_Achat']]