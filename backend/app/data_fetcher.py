import pandas as pd
from sqlalchemy import create_engine
import numpy as np
from flask import current_app
from . import app

def get_db_connection():
    """
    Establish a database connection using Flask app's dynamic configuration.
    
    Returns:
    - SQLAlchemy engine connection object
    """
    with app.app_context():
        server = app.config['SERVER']
        datawarehouse = app.config['DATAWAREHOUSE']
        driver = app.config['DRIVER']
        
        # Build the connection string dynamically from the app's config
        connection_str = f"mssql+pyodbc://{server}/{datawarehouse}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
        engine = create_engine(connection_str)
        return engine.connect() 

def fetch_sales_data():
    """
    Fetch data from the database using dynamic connection configuration.
    
    Returns:
    - DataFrame containing the result of the SQL query
    """
    query = """
    SELECT fs.quantity, dd.fulldate, dg.id_geo, ds.shop_id, dc_p.category_name
    FROM fact_sales fs
    JOIN dim_products dp ON fs.product_fk = dp.product_pk
    JOIN dim_geo dg ON fs.geo_fk = dg.geo_pk
    JOIN dim_shops ds ON fs.shop_fk = ds.shop_pk
    JOIN dim_date dd ON dd.date_pk = fs.date_fk
    JOIN dim_category_produit dc_p ON dp.category_fk = dc_p.category_pk
    """
    
    try:
        # Use the dynamic parameters to get the database connection
        conn = get_db_connection()
        
        # Fetch the data from the database
        data = pd.read_sql(query, conn)
        
        # Close the connection
        conn.close()
        
        # Ensure the data is structured correctly
        if data.empty:
            raise ValueError("No data fetched from database")
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise


def preprocess_data(df):
    # Ensure the date is in datetime format
    df['fulldate'] = pd.to_datetime(df['fulldate'])
    
    # Create time-based features
    df['days_since_start'] = (df['fulldate'] - df['fulldate'].min()).dt.days
    df['month'] = df['fulldate'].dt.month
    df['day_of_week'] = df['fulldate'].dt.dayofweek
    df['quarter'] = df['fulldate'].dt.quarter
    
    # Cyclic encoding for periodic features
    df['sin_day'] = np.sin(df['day_of_week'] * (2 * np.pi / 7))
    df['cos_day'] = np.cos(df['day_of_week'] * (2 * np.pi / 7))
    df['sin_month'] = np.sin(df['month'] * (2 * np.pi / 12))
    df['cos_month'] = np.cos(df['month'] * (2 * np.pi / 12))
    
    # Create lag features (similar to what was done during training)
    lags = 3
    for lag in range(1, lags + 1):
        df[f'lag_{lag}'] = df['quantity'].shift(lag)
    
    # Rolling features
    df['rolling_mean_3'] = df['quantity'].rolling(window=3, min_periods=1).mean()
    df['rolling_std_3'] = df['quantity'].rolling(window=3, min_periods=1).std()
    
    df = df.fillna(0)
    
    return df