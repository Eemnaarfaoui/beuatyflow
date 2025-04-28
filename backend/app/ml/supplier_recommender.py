# supplier_recommender.py
import pyodbc
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from sklearn.ensemble import RandomForestClassifier
from io import BytesIO
import base64
import warnings
import mplcursors
from functools import lru_cache

warnings.filterwarnings("ignore")

class SupplierRecommender:
    def __init__(self):
        self.server = r'AMINE\SQLEXPRESS'
        self.database = 'DW_SupplyChain'
    
    def connect_db(self):
        conn_str = (
            'DRIVER={ODBC Driver 17 for SQL Server};'
            f'SERVER={self.server};'
            f'DATABASE={self.database};'
            'Trusted_Connection=yes;'
        )
        return pyodbc.connect(conn_str)

    @lru_cache(maxsize=1)
    def get_procurement_data(self):
        try:
            conn = self.connect_db()
            query = """
            SELECT 
                P.Product_FK,
                DP.Product_Name,
                S.Supplier_Name,
                P.supplier_FK,
                P.quantite,
                P.prix,
                D.FullDate
            FROM Fact_Procurement P
            JOIN Dim_Products DP ON DP.Product_PK = P.Product_FK
            JOIN Dim_Suppliers S ON S.Supplier_PK = P.supplier_FK
            JOIN Dim_Date D ON D.Date_PK = P.Date_FK
            WHERE P.prix IS NOT NULL AND P.prix > 0
            """
            df = pd.read_sql(query, conn)
            conn.close()
            df['FullDate'] = pd.to_datetime(df['FullDate'])
            return df
        except Exception as e:
            print(f"Database error: {str(e)}")
            return pd.DataFrame()

    def generate_recommendations(self):
        df = self.get_procurement_data()
        if df.empty:
            return None

        produit_valides = (
            df.groupby('Product_FK')['supplier_FK'].nunique()
            .reset_index()
            .query('supplier_FK >= 3')['Product_FK']
            .tolist()
        )

        if not produit_valides:
            return None

        nb_a_afficher = min(50, len(produit_valides))
        produits_selectionnes = produit_valides[:nb_a_afficher]

        points = []
        recommendations = []

        for produit_id in produits_selectionnes:
            df_prod = df[df['Product_FK'] == produit_id]
            product_name = df_prod['Product_Name'].iloc[0]

            agg = df_prod.groupby('Supplier_Name').agg(
                prix_moyen=('prix', 'mean'),
                prix_ecart=('prix', 'std'),
                quantite_totale=('quantite', 'sum'),
                nb_livraisons=('FullDate', 'nunique'),
            ).fillna(0)

            if agg.shape[0] < 3:
                continue

            agg['frequence_mensuelle'] = agg['nb_livraisons'] / df_prod['FullDate'].nunique()
            agg['label'] = (
                (agg['prix_moyen'] < agg['prix_moyen'].median()) & 
                (agg['quantite_totale'] > agg['quantite_totale'].median())
            ).astype(int)

            if agg['label'].nunique() < 2:
                meilleur = agg['quantite_totale'].idxmax()
                agg['label'] = 0
                agg.loc[meilleur, 'label'] = 1

            X = agg[['prix_moyen', 'prix_ecart', 'quantite_totale', 'frequence_mensuelle']]
            y = agg['label']
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X, y)

            agg['score_recommandation'] = model.predict_proba(X)[:, 1]
            agg['Fournisseur'] = agg.index

            # Prendre uniquement le meilleur fournisseur (score le plus élevé)
            top_supplier = agg.nlargest(1, 'score_recommandation')
            for _, row in top_supplier.iterrows():
                recommendations.append({
                    'Produit': product_name,
                    'Fournisseur': row['Fournisseur'],
                    'Score': row['score_recommandation'],
                    'Prix_moyen': row['prix_moyen'],
                    'Quantite': row['quantite_totale']
                })

            for idx, row in agg.iterrows():
                points.append({
                    'Produit': product_name,
                    'Fournisseur': row['Fournisseur'],
                    'Score': row['score_recommandation'],
                    'prix_moyen': row['prix_moyen'],
                    'quantite_totale': row['quantite_totale']
                })

        if not points:
            return None

        return {
            'points': pd.DataFrame(points),
            'recommendations': recommendations,
            'total_products': len(produit_valides),
            'analyzed_products': len(produits_selectionnes)
        }

    def generate_plot(self, data):
        df_points = data['points']

        plt.figure(figsize=(12, 7))
        scatter = plt.scatter(
            df_points['prix_moyen'],
            df_points['quantite_totale'],
            c=df_points['Score'],
            cmap='viridis',
            s=100,
            edgecolor='black'
        )

        plt.xlabel("Prix moyen")
        plt.ylabel("Quantité totale livrée")
        plt.title("🌟 Recommandation des fournisseurs par produit (ML)")
        plt.colorbar(scatter, label="Score de recommandation")
        plt.grid(True)
        plt.tight_layout()

        cursor = mplcursors.cursor(scatter, hover=True)

        @cursor.connect("add")
        def on_add(sel):
            index = sel.index
            row = df_points.iloc[index]
            sel.annotation.set(text=(
                f"Produit: {row['Produit']}\n"
                f"Fournisseur: {row['Fournisseur']}\n"
                f"Score: {row['Score']:.2f}\n"
                f"Prix: {row['prix_moyen']:.2f}\n"
                f"Quantité: {row['quantite_totale']}"
            ))
            sel.annotation.get_bbox_patch().set(fc="white", alpha=0.9)

        buf = BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

    def get_recommendation_report(self):
        data = self.generate_recommendations()
        if data is None:
            return {"error": "No valid data available for recommendation"}

        plot_image = self.generate_plot(data)
        
        return {
            'plot_image': plot_image,
            'recommendations': data['recommendations'],
            'total_products': data['total_products'],
            'analyzed_products': data['analyzed_products'],
            'status': 'success'
        }
