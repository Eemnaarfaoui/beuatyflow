# C:\Users\zinel\IdeaProjects\beuatyflow\backend\app\ml\supplier_analysis.py
import pandas as pd
from sqlalchemy import create_engine
from sklearn.preprocessing import MinMaxScaler
import os
from datetime import datetime
import joblib  # Importez joblib ici

# Configuration de la base de données (à adapter à ton environnement Flask)
SERVER = "FATMA_ZINE\\FATMAZINE"
DATABASE = "DW_SupplyChain"
DRIVER = "ODBC Driver 17 for SQL Server"
DRIVER_ENCODED = DRIVER.replace(" ", "+")
CONNECTION_STRING = f"mssql+pyodbc://{SERVER}/{DATABASE}?driver={DRIVER_ENCODED}"
engine = create_engine(CONNECTION_STRING)

# Dossier pour enregistrer les images (assure-toi qu'il existe)
IMAGE_FOLDER = os.path.join('..', '..', 'static', 'images')
os.makedirs(IMAGE_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join('..', 'models', 'reliability_model.joblib')
# Sélectionner les caractéristiques (features)
FEATURES = ['Frequence_Achat', 'Volume_Total_Quantite', 'Recence_Dernier_Achat', 'Diversite_Produits']
TARGET = 'Score_Fiabilite_Achat' # Définir la variable cible

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

def calculate_reliability_score(df):
    if df.empty:
        return pd.DataFrame()

    score_features_fiab = ['Frequence_Achat', 'Volume_Total_Quantite', 'Volume_Total_Montant', 'Recence_Dernier_Achat', 'Diversite_Produits']
    df_scoring_fiab = df[score_features_fiab].copy()

    scaler_fiab = MinMaxScaler()
    df_scoring_fiab[score_features_fiab] = scaler_fiab.fit_transform(df_scoring_fiab[score_features_fiab])

    weights_fiab = {
        'Frequence_Achat': 0.2,
        'Volume_Total_Quantite': 0.25,
        'Volume_Total_Montant': 0.3,
        'Recence_Dernier_Achat': -0.15,
        'Diversite_Produits': 0.1
    }

    df['Score_Fiabilite_Achat'] = 0
    for feature, weight in weights_fiab.items():
        df['Score_Fiabilite_Achat'] += df_scoring_fiab[feature] * weight

    df_ranked_fiabilite = df.sort_values(by='Score_Fiabilite_Achat', ascending=False)
    return df_ranked_fiabilite[['supplier_FK', 'Score_Fiabilite_Achat']].head(10)

def train_reliability_model():
    df = load_supplier_data()
    if df.empty:
        print("No data available for training the model.")
        return None

    df['Date_Dernier_Achat'] = pd.to_datetime(df['Date_Dernier_Achat'])
    df['Recence_Dernier_Achat'] = (datetime.now() - df['Date_Dernier_Achat']).dt.days

    # Use the existing score as the target for training
    df_scored = calculate_reliability_score(df.copy())
    df_train = pd.merge(df[FEATURES + ['supplier_FK']], df_scored, on='supplier_FK', how='inner').dropna()

    if df_train.empty:
        print("Not enough data with reliability scores for training.")
        return None

    X = df_train[FEATURES]
    y = df_train[TARGET]

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    model = LinearRegression() # Choose your model here
    model.fit(X_scaled, y)

    # Save the trained model and the scaler
    joblib.dump((model, scaler), MODEL_PATH)
    print(f"Reliability model trained and saved to {MODEL_PATH}")
    return model

def load_reliability_model():
    try:
        return joblib.load(MODEL_PATH)
    except FileNotFoundError:
        print("Reliability model file not found. Please train the model first.")
        return None

def predict_reliability(new_data):
    try:
        loaded = joblib.load(MODEL_PATH)
        if not loaded:
            print(f"Erreur: Impossible de charger le modèle depuis {MODEL_PATH}")
            return None
        model, scaler = loaded

        new_df = pd.DataFrame([new_data])
        if 'Date_Dernier_Achat' in new_df.columns:
            try:
                new_df['Date_Dernier_Achat'] = pd.to_datetime(new_df['Date_Dernier_Achat'])
                new_df['Recence_Dernier_Achat'] = (datetime.now() - new_df['Date_Dernier_Achat']).dt.days
            except ValueError:
                print("Erreur: Format de date incorrect.")
                return None
        else:
            print("Erreur: La colonne 'Date_Dernier_Achat' est manquante dans les données de prédiction.")
            return None

        if all(feature in new_df.columns for feature in FEATURES):
            new_X = new_df[FEATURES].copy()
            try:
                new_X_scaled = scaler.transform(new_X)
                prediction = model.predict(new_X_scaled)
                return prediction[0]
            except Exception as e:
                print(f"Erreur lors de la prédiction: {e}")
                return None
        else:
            print(f"Erreur: Les colonnes requises ({FEATURES}) sont manquantes dans les données de prédiction.")
            return None

    except FileNotFoundError:
        print(f"Erreur: Le modèle {MODEL_PATH} n'a pas été trouvé.")
        return None
    except Exception as e:
        print(f"Erreur inattendue lors du chargement du modèle: {e}")
        return None

if __name__ == '__main__':
    # Exemple d'utilisation (pour test local)
    test_data = {
        'Frequence_Achat': 5,
        'Volume_Total_Quantite': 100,
        'Date_Dernier_Achat': '2025-04-20',
        'Diversite_Produits': 3
    }
    predicted_score = predict_reliability(test_data)
    if predicted_score is not None:
        print(f"Score de fiabilité prédit : {predicted_score}")

    # Ajouter cet appel pour entraîner le modèle et le sauvegarder
    train_reliability_model()