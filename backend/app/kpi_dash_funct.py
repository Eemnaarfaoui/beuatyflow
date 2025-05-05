import pandas as pd
from sqlalchemy import create_engine
from flask import current_app

def get_db_connection():
    """
    Establish a database connection using Flask app's dynamic configuration.
    
    Returns:
    - SQLAlchemy engine connection object
    """
    server = current_app.config['SERVER']
    datawarehouse = current_app.config['DATAWAREHOUSE']
    driver = current_app.config['DRIVER']
    
    connection_str = f"mssql+pyodbc://{server}/{datawarehouse}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    engine = create_engine(connection_str)
    return engine.connect()

def get_sa_connection():
    server =current_app.config['SERVER']
    sa= current_app.config['STAGING_AREA']
    driver = current_app.config['DRIVER']
    connection_str_sa = f"mssql+pyodbc://{server}/{sa}?trusted_connection=yes&driver={driver.replace(' ', '+')}"
    engine = create_engine(connection_str_sa)
    return engine.connect()


def get_kpis():
    query_shops = "SELECT COUNT(*) as total_shops FROM [Dim_Shops]"
    query_products = "SELECT COUNT(*) as total_products FROM [Dim_Products]"
    query_orders = "SELECT COUNT(*) as total_orders FROM [Fact_Sales]"
    query_revenue = """
    SELECT SUM(f.Quantity * p.Unit_Price) AS TotalRevenue
    FROM [DW_SupplyChain].[dbo].[Fact_Sales] f
    JOIN [DW_SupplyChain].[dbo].[Dim_Products] p ON f.PRODUCT_FK = p.Product_PK
    """
    try:
        # Use the dynamic parameters to get the database connection
        conn = get_db_connection()
        
        # Fetch the data from the database
        result_shops = pd.read_sql(query_shops, conn)
        result_products = pd.read_sql(query_products, conn)
        result_orders = pd.read_sql(query_orders, conn)
        result_revenue = pd.read_sql(query_revenue, conn)
        
        # Convert the result into a serializable format (dictionary)
        total_products = result_products.to_dict(orient='records')[0]['total_products']
        total_shops = result_shops.to_dict(orient='records')[0]['total_shops']
        total_orders = result_orders.to_dict(orient='records')[0]['total_orders']
        total_revenue = result_revenue.to_dict(orient='records')[0]['TotalRevenue']
        # Close the connection
        conn.close()
        
        return {
            "total_shops": total_shops,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue
        }
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise


