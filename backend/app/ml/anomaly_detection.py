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
from dataclasses import dataclass
from typing import Optional, Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DatabaseConfig:
    server: str = r'AMINE\SQLEXPRESS'
    database: str = 'DW_SupplyChain'
    driver: str = 'ODBC Driver 17 for SQL Server'

@dataclass
class ModelConfig:
    n_estimators: int = 150
    contamination: float = 0.05
    random_state: int = 42

@dataclass
class AnomalyReport:
    plot_image: str
    critical_products: List[Dict[str, Any]]
    total_anomalies: int
    status: str = "success"

class AnomalyDetector:
    """Detects stock anomalies using Isolation Forest algorithm."""
    
    def __init__(self, db_config: Optional[DatabaseConfig] = None, 
                 model_config: Optional[ModelConfig] = None):
        self.db_config = db_config or DatabaseConfig()
        self.model_config = model_config or ModelConfig()
        
    def _get_connection_string(self) -> str:
        """Generate connection string from config."""
        return (
            f'DRIVER={{{self.db_config.driver}}};'
            f'SERVER={self.db_config.server};'
            f'DATABASE={self.db_config.database};'
            'Trusted_Connection=yes;'
        )

    def connect_db(self) -> pyodbc.Connection:
        """Establish database connection."""
        try:
            return pyodbc.connect(self._get_connection_string())
        except pyodbc.Error as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise

    @lru_cache(maxsize=1)
    def get_stock_data(self) -> pd.DataFrame:
        """Retrieve stock data from database with caching."""
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
        
        try:
            with self.connect_db() as conn:
                df = pd.read_sql(query, conn)
                logger.info(f"Retrieved {len(df)} stock records")
                return df
        except Exception as e:
            logger.error(f"Database query failed: {str(e)}")
            return pd.DataFrame()

    def _train_model(self, data: pd.DataFrame) -> pd.DataFrame:
        """Train Isolation Forest model and predict anomalies."""
        model = IsolationForest(
            n_estimators=self.model_config.n_estimators,
            contamination=self.model_config.contamination,
            random_state=self.model_config.random_state
        )
        
        data['anomaly'] = model.fit_predict(data[['rest_quantity']].values)
        data['critical_threshold'] = data['avg_category'] * 0.2
        data['critical_shortage'] = (
            (data['anomaly'] == -1) & 
            (data['rest_quantity'] < data['critical_threshold'])
        )
        return data

    def detect_anomalies(self) -> Optional[pd.DataFrame]:
        """Detect stock anomalies in the dataset."""
        df = self.get_stock_data()
        if df.empty:
            logger.warning("No data available for anomaly detection")
            return None
        return self._train_model(df)

    def _create_plot(self, df: pd.DataFrame) -> plt.Figure:
        """Create matplotlib visualization of stock anomalies."""
        shortages = df[df['critical_shortage']].sort_values('rest_quantity')
        normals = df[~df['critical_shortage']]

        fig, ax = plt.subplots(figsize=(20, 10))
        
        # Plot normal stock points
        sc_normal = ax.scatter(
            normals.index, normals['rest_quantity'], 
            c='#4CAF50', alpha=0.6, s=50, label='Normal Stock'
        )
        
        # Plot critical shortages if any exist
        sc_shortage = None
        if not shortages.empty:
            sc_shortage = ax.scatter(
                shortages.index, shortages['rest_quantity'],
                c='#F44336', s=150, edgecolor='black', 
                marker='X', label='Imminent Shortage'
            )
            
            # Add threshold lines for critical products
            for _, row in shortages.iterrows():
                ax.axhline(
                    y=row['critical_threshold'], 
                    color='#FF9800', linestyle='--', alpha=0.3
                )

        # Configure plot appearance
        ax.set_title("Imminent Stock Shortage Detection", fontsize=16, pad=20)
        ax.set_ylabel("Current Stock Quantity", fontsize=12)
        ax.set_xlabel("Products (index)", fontsize=12)
        ax.grid(True, linestyle='--', alpha=0.3)
        ax.legend(fontsize=12)
        
        # Add interactive hover functionality
        self._add_hover_interactivity(ax, sc_normal, sc_shortage, normals, shortages)
        
        return fig

    def _add_hover_interactivity(self, ax: plt.Axes, sc_normal: Any, 
                               sc_shortage: Any, normals: pd.DataFrame, 
                               shortages: pd.DataFrame) -> None:
        """Add interactive hover tooltips to the plot."""
        cursor = mplcursors.cursor(hover=True)

        @cursor.connect("add")
        def on_add(sel):
            idx = sel.index
            if sel.artist == sc_normal:
                row = normals.iloc[idx]
                text = (
                    f"Product: {row['Product_Name']}\n"
                    f"Warehouse: {row['Warehouse_Name']}\n"
                    f"Stock: {row['rest_quantity']}\n"
                    f"Category average: {int(row['avg_category'])}"
                )
            elif sc_shortage is not None and sel.artist == sc_shortage:
                row = shortages.iloc[idx]
                text = (
                    f"⚠️ CRITICAL SHORTAGE ⚠️\n"
                    f"Product: {row['Product_Name']}\n"
                    f"Warehouse: {row['Warehouse_Name']}\n"
                    f"Current stock: {row['rest_quantity']}\n"
                    f"Critical threshold: {int(row['critical_threshold'])}\n"
                    f"Deficit: {int(row['critical_threshold'] - row['rest_quantity'])}"
                )
            
            sel.annotation.set_text(text)
            sel.annotation.get_bbox_patch().set(
                fc="white", alpha=0.95, boxstyle="round,pad=0.5"
            )

    def _fig_to_base64(self, fig: plt.Figure) -> str:
        """Convert matplotlib figure to base64 encoded PNG."""
        buf = BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

    def get_anomaly_report(self) -> Dict[str, Any]:
        """Generate comprehensive anomaly report."""
        df = self.detect_anomalies()
        if df is None:
            logger.error("No data available for report generation")
            return {"error": "No data available", "status": "error"}

        try:
            fig = self._create_plot(df)
            plot_image = self._fig_to_base64(fig)
            
            critical_products = df[df['critical_shortage']][
                ['Product_Name', 'Warehouse_Name', 'rest_quantity', 'critical_threshold']
            ].sort_values('rest_quantity').to_dict('records')

            return AnomalyReport(
                plot_image=plot_image,
                critical_products=critical_products,
                total_anomalies=len(critical_products)
            ).__dict__

        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return {"error": str(e), "status": "error"}