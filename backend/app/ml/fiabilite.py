# backend/app/ml/supplier_analysis.py
import pandas as pd
from sqlalchemy import create_engine
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime

# Configuration de la base de données (à adapter à ton environnement Flask)
SERVER = "FATMA_ZINE\\FATMAZINE"
DATABASE = "DW_SupplyChain"
DRIVER = "ODBC Driver 17 for SQL Server"
DRIVER_ENCODED = DRIVER.replace(" ", "+")
CONNECTION_STRING = f"mssql+pyodbc://{SERVER}/{DATABASE}?driver={DRIVER_ENCODED}"
engine = create_engine(CONNECTION_STRING)

# Dossier pour enregistrer les images (assure-toi qu'il existe)
IMAGE_FOLDER = os.path.join('..', 'static', 'images')
os.makedirs(IMAGE_FOLDER, exist_ok=True)

# Sélectionner les caractéristiques (features)
features = ['Frequence_Achat', 'Volume_Total_Quantite', 'Recence_Dernier_Achat', 'Diversite_Produits']

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

def generate_histogram_plots(df):
    if df.empty:
        return None
    plt.figure(figsize=(15, 10))
    for i, feature in enumerate(features):
        plt.subplot(2, 2, i + 1)
        sns.histplot(df[feature], kde=True)
        plt.title(get_french_title(feature))
    plt.tight_layout()
    filename = os.path.join(IMAGE_FOLDER, 'histogram_distributions.png')
    plt.savefig(filename)
    plt.close()
    return f'/ml/images/histogram_distributions.png'

def generate_reliability_plot(df_ranked):
    if df_ranked.empty:
        return None
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Score_Fiabilite_Achat', y='supplier_FK', data=df_ranked)
    plt.title(f'Top 10 Fournisseurs par Score de Fiabilité d\'Achat')
    plt.xlabel('Score de Fiabilité d\'Achat')
    plt.ylabel('Supplier_FK')
    plt.tight_layout()
    filename = os.path.join(IMAGE_FOLDER, 'top_suppliers_reliability.png')
    plt.savefig(filename)
    plt.close()
    return f'/ml/images/top_suppliers_reliability.png'

def get_french_title(feature_name):
    if feature_name == 'Frequence_Achat':
        return 'Distribution de la Fréquence d\'Achat'
    elif feature_name == 'Volume_Total_Quantite':
        return 'Distribution du Volume Total de Quantité Achetée'
    elif feature_name == 'Recence_Dernier_Achat':
        return 'Distribution de la Récence du Dernier Achat (en jours)'
    elif feature_name == 'Diversite_Produits':
        return 'Distribution de la Diversité des Produits Achetés'
    return feature_name

if __name__ == '__main__':
    from backend.app import create_app
    app = create_app()
    with app.app_context():
        data = load_supplier_data()
        if not data.empty:
            data['Date_Dernier_Achat'] = pd.to_datetime(data['Date_Dernier_Achat'])
            data['Recence_Dernier_Achat'] = (datetime(2025, 4, 27) - data['Date_Dernier_Achat']).dt.days
            reliability_ranking = calculate_reliability_score(data.copy())
            print("Classement de fiabilité (exemple):\n", reliability_ranking)
            histogram_path = generate_histogram_plots(data[features].copy())
            if histogram_path:
                print(f"Graphique d'histogrammes enregistré sous : {histogram_path}")
            reliability_plot_path = generate_reliability_plot(reliability_ranking.copy())
            if reliability_plot_path:
                print(f"Graphique de fiabilité enregistré sous : {reliability_plot_path}")