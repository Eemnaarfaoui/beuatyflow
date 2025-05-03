import pyodbc 
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from matplotlib.patches import FancyBboxPatch
from matplotlib.colors import LinearSegmentedColormap
from sklearn.ensemble import RandomForestClassifier
from io import BytesIO
import base64
import warnings
import mplcursors
from functools import lru_cache
import numpy as np

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

    def get_score_color(self, score):
        if score >= 0.7:
            return '#4CAF50'  # Green
        elif score >= 0.4:
            return '#FFC107'  # Yellow
        else:
            return '#F44336'  # Red

    def generate_plot(self, data):
        df_points = data['points']
        if df_points.empty:
            return None

        # HD Figure setup
        fig, ax = plt.subplots(figsize=(16, 10), dpi=100)

        # Background gradient
        fig.patch.set_facecolor('#f8fafc')
        ax.set_facecolor('#f1f5f9')

        # Scatter plot
        scatter = ax.scatter(
            df_points['avg_price'],
            df_points['total_quantity'],
            c=df_points['Score'],
            cmap='viridis',
            s=300,
            edgecolor='black',
            linewidth=0.8,
            alpha=0.85
        )

        # Title and labels
        ax.set_title("Supplier Recommendations by Product", fontsize=20, fontweight='bold', color='#1e293b', pad=20)
        ax.set_xlabel("Average Price (TND)", fontsize=14, labelpad=15, color='#334155')
        ax.set_ylabel("Total Delivered Quantity", fontsize=14, labelpad=15, color='#334155')

        # Grid and spines
        ax.grid(True, which='major', linestyle='--', linewidth=0.5, color='#cbd5e1')
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Ticks style
        ax.tick_params(colors='#64748b', labelsize=12)

        # Color bar
        cbar = plt.colorbar(scatter, ax=ax, pad=0.02)
        cbar.set_label("Recommendation Score (0-1)", fontsize=13, color='#334155')
        cbar.ax.tick_params(labelsize=11, colors='#334155')

        # Annotations with hover (only if needed in interactive env)
        try:
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
        except:
            pass  # mplcursors is optional, avoid crash on headless servers

        # Save to buffer
        buf = BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=200)  # HD export
        plt.close(fig)
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