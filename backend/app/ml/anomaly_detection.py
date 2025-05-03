# app/ml/anomaly_detection.py
import pyodbc
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from io import BytesIO
import base64
from functools import lru_cache
import mplcursors

class AnomalyDetector:
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
    def get_stock_data(self):
        try:
            conn = self.connect_db()
            query = """
            SELECT 
                FS.product_FK,
                DP.Product_Name,
                DW.Warehouse_Name,
                FS.rest_quantity,
                (SELECT AVG(rest_quantity) 
                 FROM Fact_Storage FS2 
                 JOIN Dim_Products DP2 ON DP2.Product_PK = FS2.product_FK 
                 WHERE DP2.Category_FK = DP.Category_FK) AS avg_category
            FROM Fact_Storage FS
            JOIN Dim_Warehouses DW ON DW.Warehouse_PK = FS.warehouse_FK
            JOIN Dim_Products DP ON DP.Product_PK = FS.product_FK
            WHERE FS.rest_quantity >= 0
            """
            df = pd.read_sql(query, conn)
            conn.close()
            return df
        except Exception as e:
            print(f"Database error: {str(e)}")
            return pd.DataFrame()

    def detect_anomalies(self):
        df = self.get_stock_data()
        if df.empty:
            return None

        model = IsolationForest(n_estimators=150, contamination=0.05, random_state=42)
        df['anomaly'] = model.fit_predict(df[['rest_quantity']].values)
        df['critical_threshold'] = df['avg_category'] * 0.2
        df['critical_shortage'] = (df['anomaly'] == -1) & (df['rest_quantity'] < df['critical_threshold'])
        return df

    def generate_plot(self, df):
        shortages = df[df['critical_shortage']].sort_values('rest_quantity')
        normals = df[~df['critical_shortage']]

        plt.figure(figsize=(20, 10))
        sc_normal = plt.scatter(normals.index, normals['rest_quantity'], c='green', alpha=0.6, s=50, label='Normal Stock')
        sc_shortage = None
        if not shortages.empty:
            sc_shortage = plt.scatter(shortages.index, shortages['rest_quantity'], c='red', s=150,
                                      edgecolor='black', marker='X', label='Imminent Shortage')
            for idx, row in shortages.iterrows():
                plt.axhline(y=row['critical_threshold'], color='orange', linestyle='--', alpha=0.3)

        plt.title("Imminent Stock Shortage Detection")
        plt.ylabel("Current Stock Quantity")
        plt.xlabel("Products (index)")
        plt.grid(True, linestyle='--', alpha=0.3)
        plt.legend()

        cursor = mplcursors.cursor(hover=True)

        @cursor.connect("add")
        def on_add(sel):
            idx = sel.index
            if sel.artist == sc_normal:
                row = normals.iloc[idx]
                text = (f"Product: {row['Product_Name']}\n"
                        f"Warehouse: {row['Warehouse_Name']}\n"
                        f"Stock: {row['rest_quantity']}\n"
                        f"Category average: {int(row['avg_category'])}")
            elif sc_shortage is not None and sel.artist == sc_shortage:
                row = shortages.iloc[idx]
                text = (f"⚠️ CRITICAL SHORTAGE ⚠️\n"
                        f"Product: {row['Product_Name']}\n"
                        f"Warehouse: {row['Warehouse_Name']}\n"
                        f"Current stock: {row['rest_quantity']}\n"
                        f"Critical threshold: {int(row['critical_threshold'])}\n"
                        f"Deficit: {int(row['critical_threshold'] - row['rest_quantity'])}")
            sel.annotation.set_text(text)
            sel.annotation.get_bbox_patch().set(fc="white", alpha=0.95, boxstyle="round,pad=0.5")

        buf = BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

    def get_anomaly_report(self):
        df = self.detect_anomalies()
        if df is None:
            return {"error": "No data available"}

        plot_image = self.generate_plot(df)
        critical = df[df['critical_shortage']][
            ['Product_Name', 'Warehouse_Name', 'rest_quantity', 'critical_threshold']
        ].sort_values('rest_quantity')

        return {
            'plot_image': plot_image,
            'critical_products': critical.to_dict('records'),
            'total_anomalies': len(critical),
            'status': 'success'
        }
