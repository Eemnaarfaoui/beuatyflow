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

        valid_products = (
            df.groupby('Product_FK')['supplier_FK'].nunique()
            .reset_index()
            .query('supplier_FK >= 3')['Product_FK']
            .tolist()
        )

        if not valid_products:
            return None

        num_to_display = min(50, len(valid_products))
        selected_products = valid_products[:num_to_display]

        points = []
        recommendations = []

        for product_id in selected_products:
            df_prod = df[df['Product_FK'] == product_id]
            product_name = df_prod['Product_Name'].iloc[0]

            agg = df_prod.groupby('Supplier_Name').agg(
                avg_price=('prix', 'mean'),
                price_std=('prix', 'std'),
                total_quantity=('quantite', 'sum'),
                delivery_count=('FullDate', 'nunique'),
            ).fillna(0)

            if agg.shape[0] < 3:
                continue

            agg['monthly_frequency'] = agg['delivery_count'] / df_prod['FullDate'].nunique()
            agg['label'] = (
                (agg['avg_price'] < agg['avg_price'].median()) & 
                (agg['total_quantity'] > agg['total_quantity'].median())
            ).astype(int)

            if agg['label'].nunique() < 2:
                best_supplier = agg['total_quantity'].idxmax()
                agg['label'] = 0
                agg.loc[best_supplier, 'label'] = 1

            X = agg[['avg_price', 'price_std', 'total_quantity', 'monthly_frequency']]
            y = agg['label']
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X, y)

            agg['recommendation_score'] = model.predict_proba(X)[:, 1]
            agg['Supplier'] = agg.index

            top_supplier = agg.nlargest(1, 'recommendation_score')
            for _, row in top_supplier.iterrows():
                recommendations.append({
                    'Product': product_name,
                    'Supplier': row['Supplier'],
                    'Score': row['recommendation_score'],
                    'Avg_Price': row['avg_price'],
                    'Quantity': row['total_quantity']
                })

            for idx, row in agg.iterrows():
                points.append({
                    'Product': product_name,
                    'Supplier': row['Supplier'],
                    'Score': row['recommendation_score'],
                    'avg_price': row['avg_price'],
                    'total_quantity': row['total_quantity']
                })

        if not points:
            return None

        return {
            'points': pd.DataFrame(points),
            'recommendations': recommendations,
            'total_products': len(valid_products),
            'analyzed_products': len(selected_products)
        }

    def generate_plot(self, data):
        df_points = data['points']

        plt.figure(figsize=(12, 7))
        scatter = plt.scatter(
            df_points['avg_price'],
            df_points['total_quantity'],
            c=df_points['Score'],
            cmap='viridis',
            s=100,
            edgecolor='black'
        )

        plt.xlabel("Average Price (TND)")
        plt.ylabel("Total Delivered Quantity")
        plt.title("🌟 Supplier Recommendations by Product (ML Model)")
        plt.colorbar(scatter, label="Recommendation Score (0-1)")
        plt.grid(True)
        plt.tight_layout()

        cursor = mplcursors.cursor(scatter, hover=True)

        @cursor.connect("add")
        def on_add(sel):
            index = sel.index
            row = df_points.iloc[index]
            sel.annotation.set(text=(
                f"Product: {row['Product']}\n"
                f"Supplier: {row['Supplier']}\n"
                f"Score: {row['Score']:.2f}\n"
                f"Price: {row['avg_price']:.2f}\n"
                f"Quantity: {row['total_quantity']}"
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