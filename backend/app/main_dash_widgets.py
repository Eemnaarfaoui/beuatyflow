import pandas as pd
from sqlalchemy import create_engine, text
from flask import current_app

from .data_fetcher import get_db_connection, get_sa_connection

def get_total_products_per_warehouse_by_category():
    query = """
    SELECT 
        w.Warehouse_ID,
        c.Category_Name,
        SUM(i.Quantity) AS Total_Products
    FROM 
        Fact_Storage s 
    JOIN 
        Dim_Products p ON i.Product_FK = p.Product_PK
    JOIN 
        Dim_Category_Produit c ON p.Category_FK = c.Category_PK
    JOIN 
        Dim_Warehouses w ON i.Warehouse_FK = w.Warehouse_PK
    GROUP BY 
        w.Warehouse_ID, c.Category_Name
    ORDER BY 
        w.Warehouse_ID, c.Category_Name;
    """
    
    try:
        conn = get_db_connection()
        
        # Execute the query
        result = conn.execute(text(query)).fetchall()
        
        # Close the connection
        conn.close()

        # Convert the result into a serializable format
        return [{"Warehouse_ID": row[0], "Category_Name": row[1], "Total_Products": row[2]} for row in result]
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise


