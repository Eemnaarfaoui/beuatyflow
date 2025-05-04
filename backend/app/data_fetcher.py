import pandas as pd
from sqlalchemy import create_engine, text
import numpy as np
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
    
    # Build the connection string dynamically from the app's config
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

def fetch_sales_data():
    """
    Fetch data from the database using dynamic connection configuration.
    
    Returns:
    - DataFrame containing the result of the SQL query
    """
    query = """
    SELECT fs.quantity, dd.fulldate, dg.id_geo, ds.shop_id, dc_p.category_name,dp.product_name
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

# CRUD SHOPS ( alternating between the DW and the SA)
# READ
def fetch_shops_dw():
    query= """ SELECT 
    * from Shops_SA
    """

    try:
        # Use the dynamic parameters to get the database connection
        conn = get_sa_connection()
        
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

#CREATE
def add_shops_sa(shopid,shopname, contact, email, address, city, country):
    """
    Insert a new shop into the Shops_SA table in the Staging Area (SA) database.

    Parameters:
    - shopid: str - Unique identifier for the shop (varchar(50))
    - shopname: str - Name of the shop (varchar(255))
    - contact: str - Contact person or number (varchar(255))
    - email: str - Contact email (varchar(255))
    - address: str - Full address (varchar(255))
    - city: str - City name (varchar(100))
    - country: str - Country name (varchar(100))
    - id_geo: str - Geographical ID linking to dim_geo (varchar(100))
    
    Raises:
    - Exception if insertion fails
    """
    id_geo = f"{city}_{country}".replace(" ", "_")
    insert_query = """
    INSERT INTO Shops_SA (shopid,shopname, contact, email, address, city, country, id_geo)
    VALUES ( :shopid, :shopname, :contact, :email, :address, :city, :country, :id_geo)
    """
    
    try:
        # Establish connection to Staging Area
        conn = get_sa_connection()

        # Execute the insert query with bound parameters
        conn.execute(
            text(insert_query),
            {
                "shopid": shopid,
                "shopname": shopname,
                "contact": contact,
                "email": email,
                "address": address,
                "city": city,
                "country": country,
                "id_geo": id_geo
            }
        )

        # Commit and close the connection
        conn.commit()
        conn.close()

        print(f"Shop '{shopname}' inserted successfully into Shops_SA.")

    except Exception as e:
        print(f"Error inserting shop into Shops_SA: {e}")
        raise 

#UPDATE
def update_shop_in_sa(shopid, shopname, contact, email, address, city, country):
    """
    Update an existing shop in the Shops_SA table, and automatically update id_geo based on city and country.
    
    Parameters:
    - shopid: str - ID of the shop to update (must exist)
    - shopname: str - New shop name
    - contact: str - New contact person or number
    - email: str - New email
    - address: str - New address
    - city: str - New city name
    - country: str - New country name
    """
    # Rebuild id_geo dynamically
    id_geo = f"{city}_{country}".replace(" ", "_")

    conn = get_sa_connection()
    check_query = "SELECT COUNT(*) AS count FROM Shops_SA WHERE shopid = :shopid"
    result = conn.execute(text(check_query), {"shopid": shopid})
    row = result.fetchone()

    if row is None or row.count == 0:
        conn.close()
        raise ValueError(f"Shop with ID '{shopid}' not found.")
    
    update_query = """
    UPDATE Shops_SA
    SET 
        shopname = :shopname,
        contact = :contact,
        email = :email,
        address = :address,
        city = :city,
        country = :country,
        id_geo = :id_geo
    WHERE 
        shopid = :shopid
    """
    try:
        conn = get_sa_connection()

        result = conn.execute(
            text(update_query),
            {
                "shopid": shopid,
                "shopname": shopname,
                "contact": contact,
                "email": email,
                "address": address,
                "city": city,
                "country": country,
                "id_geo": id_geo
            }
        )

        conn.commit()
        conn.close()

        if result.rowcount == 0:
            print(f"No shop found with shopid '{shopid}'. No update done.")
        else:
            print(f"Shop '{shopid}' updated successfully with new id_geo '{id_geo}'.")

    except Exception as e:
        print(f"Error updating shop in Shops_SA: {e}")
        raise

#DELETE
def delete_shop_sa(shopid):
    """
    Delete a shop from the Shops_SA table in the Staging Area (SA) database.

    Parameters:
    - shopid: str - Unique identifier for the shop (varchar(50))

    Raises:
    - Exception if deletion fails
    """
    delete_query = "DELETE FROM Shops_SA WHERE shopid = :shopid"
    
    try:
        # Establish connection to Staging Area
        conn = get_sa_connection()

        # Execute the delete query with bound parameters
        result = conn.execute(text(delete_query), {"shopid": shopid})

        # Commit and close the connection
        conn.commit()
        conn.close()

        if result.rowcount == 0:
            print(f"No shop found with ID '{shopid}'. No deletion done.")
        else:
            print(f"Shop with ID '{shopid}' deleted successfully from Shops_SA.")

    except Exception as e:
        print(f"Error deleting shop from Shops_SA: {e}")
        raise

################# ORDERS CRUD #######################
def fetch_orders_sa():
    """
    Fetch all orders from the Orders_SA table.

    Returns:
    - DataFrame containing the result of the SQL query
    """
    query = """
    SELECT 
        OrderID, OrderDate, ShopID, ShippingAddress, ProductName, Quantity, ProductId, 
        Shipping_City, Shipping_Country, Shipping_ID, Shop_City, Shop_Country, Shop_Geo_ID
    FROM Orders_SA
    """
    try:
        conn = get_sa_connection()
        data = pd.read_sql(query, conn)
        conn.close()
        if data.empty:
            raise ValueError("No data fetched from the Orders_SA table")
        return data
    except Exception as e:
        print(f"Error fetching orders: {e}")
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


##########storage##############################
def fetch_storage_data():
    """
    Fetch data from the database using dynamic connection configuration.
    
    Returns:
    - DataFrame containing the result of the SQL query
    """
    query = """
       SELECT 
          fs.warehouse_FK,
          fs.product_FK,
          fs.rest_quantity,
          fs.predicted_quantity,
          dp.Product_Name,
          dg.City,
          dg.Country,
          dw.Warehouse_Name,
          dw.Warehouse_ID,
          dw.Cluster,
          dw.Capacity
        FROM DW_Supply_Chain.dbo.Fact_Storage AS fs
         JOIN Dim_Warehouses AS dw ON dw.Warehouse_PK = fs.warehouse_FK
        JOIN Dim_Products AS dp ON dp.Product_PK = fs.product_FK
        JOIN Dim_Geo AS dg ON dg.Geo_PK = dw.Geo_FK
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

## READ
def fetch_warehouses_dw():
    query = """SELECT * FROM Warehouses_SA"""

    try:
        conn = get_sa_connection()
        data = pd.read_sql(query, conn)
        conn.close()

        if data.empty:
            raise ValueError("No data fetched from database")
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise

# CREATE
def add_warehouse_sa(warehouseid, warehousename, location, capacity, city, country):
    id_geo = f"{city}_{country}".replace(" ", "_")
    insert_query = """
    INSERT INTO Warehouses_SA (warehouseid, warehousename, location, capacity, id_geo, city, country)
    VALUES (:warehouseid, :warehousename, :location, :capacity, :id_geo, :city, :country)
    """
    
    try:
        conn = get_sa_connection()
        conn.execute(
            text(insert_query),
            {
                "warehouseid": warehouseid,
                "warehousename": warehousename,
                "location": location,
                "capacity": capacity,
                "id_geo": id_geo,
                "city": city,
                "country": country,
                
            }
        )
        conn.commit()
        conn.close()
        print(f"Warehouse '{warehousename}' inserted successfully into Warehouses_SA.")
    except Exception as e:
        print(f"Error inserting warehouse into Warehouses_SA: {e}")
        raise

# UPDATE
def update_warehouse_in_sa(warehouseid, warehousename, location, capacity, city, country):
    id_geo = f"{city}_{country}".replace(" ", "_")

    conn = get_sa_connection()
    check_query = "SELECT COUNT(*) AS count FROM Warehouses_SA WHERE warehouseid = :warehouseid"
    result = conn.execute(text(check_query), {"warehouseid": warehouseid})
    row = result.fetchone()

    if row is None or row.count == 0:
        conn.close()
        raise ValueError(f"Warehouse with ID '{warehouseid}' not found.")
    
    update_query = """
    UPDATE Warehouses_SA
    SET 
        warehousename = :warehousename,
        location = :location,
        capacity = :capacity,
        id_geo = :id_geo,
        city = :city,
        country = :country
        
    WHERE 
        warehouseid = :warehouseid
    """
    try:
        conn = get_sa_connection()
        result = conn.execute(
            text(update_query),
            {
                "warehouseid": warehouseid,
                "warehousename": warehousename,
                "location": location,
                "capacity": capacity,
                "id_geo": id_geo,
                "city": city,
                "country": country,
            }  
        )    
         
        conn.commit()
        conn.close()

        if result.rowcount == 0:
            print(f"No warehouse found with warehouseid '{warehouseid}'. No update done.")
        else:
            print(f"Warehouse '{warehouseid}' updated successfully with new id_geo '{id_geo}'.")
    except Exception as e:
        print(f"Error updating warehouse in Warehouses_SA: {e}")
        raise

# DELETE
def delete_warehouse_sa(warehouseid):
    delete_query = "DELETE FROM Warehouses_SA WHERE warehouseid = :warehouseid"
    
    try:
        conn = get_sa_connection()
        result = conn.execute(text(delete_query), {"warehouseid": warehouseid})
        conn.commit()
        conn.close()

        if result.rowcount == 0:
            print(f"No warehouse found with ID '{warehouseid}'. No deletion done.")
        else:
            print(f"Warehouse with ID '{warehouseid}' deleted successfully from Warehouses_SA.")
    except Exception as e:
        print(f"Error deleting warehouse from Warehouses_SA: {e}")
        raise
##########inventory########################
# --- READ (avec jointure) ---

def fetch_inventory_sa():
    query = """
    SELECT 
        I.Warehouse_ID,
        I.Warehouse_Name,
        I.Location,
        I.Product_ID,
        I.Quantity,
        P.productname
    FROM [SA_Supply_Chain].[dbo].[Inventory_SA] I
    LEFT JOIN [SA_Supply_Chain].[dbo].[Products_SA] P
        ON I.Product_ID = P.productid
    """
    try:
        conn = get_sa_connection()
        data = pd.read_sql(query, conn)
        conn.close()
        if data.empty:
            raise ValueError("No inventory data found.")
        return data
    except Exception as e:
        print(f"Error fetching inventory data: {e}")
        raise

def add_inventory_sa(warehouse_id, warehouse_name, location, product_name, quantity):
    query = """
    INSERT INTO [SA_Supply_Chain].[dbo].[Inventory_SA] (
       Warehouse_ID, Warehouse_Name, Location, Product_ID, Quantity
    )
    VALUES (
      :warehouse_id, :warehouse_name, :location, 
      (SELECT productid FROM [SA_Supply_Chain].[dbo].[Products_SA] WHERE productname = :product_name),
      :quantity
    )
    """
    try:
        conn = get_sa_connection()
        conn.execute(text(query), {
            "warehouse_id": warehouse_id,
            "warehouse_name": warehouse_name,
            "location": location,
            "product_name": product_name,
            "quantity": quantity
        })
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error inserting inventory: {e}")
        raise

def update_inventory_sa(warehouse_id, warehouse_name, location, product_name, quantity):
    query = """
    UPDATE [SA_Supply_Chain].[dbo].[Inventory_SA]
    SET Warehouse_Name = :warehouse_name,
        Location = :location,
        Product_ID = (SELECT productid FROM [SA_Supply_Chain].[dbo].[Products_SA] WHERE productname = :product_name),
        Quantity = :quantity
    WHERE Warehouse_ID = :warehouse_id
    """
    try:
        conn = get_sa_connection()
        result = conn.execute(text(query), {
            "warehouse_id": warehouse_id,
            "warehouse_name": warehouse_name,
            "location": location,
            "product_name": product_name,
            "quantity": quantity
        })
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error updating inventory: {e}")
        raise

def delete_inventory_sa(warehouse_id):
    query = "DELETE FROM [SA_Supply_Chain].[dbo].[Inventory_SA] WHERE Warehouse_ID = :warehouse_id"
    try:
        conn = get_sa_connection()
        result = conn.execute(text(query), {"warehouse_id": warehouse_id})
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error deleting inventory: {e}")
        raise

def fetch_products_sa():
    query = "SELECT productid, productname FROM [SA_Supply_Chain].[dbo].[Products_SA]"
    try:
        conn = get_sa_connection()
        data = pd.read_sql(query, conn)
        conn.close()
        return data
    except Exception as e:
        print(f"Error fetching products: {e}")
        raise
