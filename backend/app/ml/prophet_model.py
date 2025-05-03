
import pandas as pd
from prophet import Prophet
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from sqlalchemy import create_engine
from functools import lru_cache

def connect_db():
    connection_str = "mssql+pyodbc://AMINE/SA_Supply_Chaine?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
    return create_engine(connection_str)

def get_data():
    engine = connect_db()
    try:
        query = """
        SELECT [Date], [Supplier], [Unit_Price__TND_]
        FROM Extracted_InvoicesOCR
        WHERE [Unit_Price__TND_] > 0
        """
        df = pd.read_sql(query, engine)
        
        # Data cleaning
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
        df['Unit_Price__TND_'] = df['Unit_Price__TND_'].astype(str).str.replace(',', '.').astype(float)
        df['Supplier'] = df['Supplier'].str.strip()
        
        # Remove outliers
        df = df[(df['Unit_Price__TND_'] > df['Unit_Price__TND_'].quantile(0.05)) &
                (df['Unit_Price__TND_'] < df['Unit_Price__TND_'].quantile(0.95))]
        
        return df
    finally:
        engine.dispose()

def create_forecast_plot(model, forecast, supplier_name):
    """Creates a forecast plot and returns it as base64"""
    fig = plt.figure(figsize=(12, 6), facecolor='white')
    ax = fig.add_subplot(111)
    
    # Plot the forecast
    model.plot(forecast, ax=ax)
    ax.set_title(f'Price Forecast for: {supplier_name}', fontsize=14)
    ax.set_xlabel('Date', fontsize=12)
    ax.set_ylabel('Unit Price (TND)', fontsize=12)
    ax.grid(True, linestyle='--', alpha=0.6)
    
    # Save to memory buffer
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig)  # Explicit close to free memory
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

@lru_cache(maxsize=10)  # Cache models for 10 different suppliers
def train_forecast_supplier(supplier_name, periods=12):
    """Trains the model and returns formatted results"""
    df = get_data()
    
    # Monthly aggregation
    monthly_prices = (
        df.groupby(['Supplier', pd.Grouper(key='Date', freq='MS')])['Unit_Price__TND_']
        .mean()
        .reset_index()
        .rename(columns={'Date': 'ds', 'Unit_Price__TND_': 'y'})
    )
    
    df_supplier = monthly_prices[monthly_prices['Supplier'] == supplier_name][['ds', 'y']]
    
    if len(df_supplier) < 12:
        raise ValueError(f"Not enough data for {supplier_name} (minimum 12 months required)")
    
    # Model training
    model = Prophet()
    model.fit(df_supplier)
    
    # Forecast
    future = model.make_future_dataframe(periods=periods, freq='MS')
    forecast = model.predict(future)
    
    # Create plot
    plot_image = create_forecast_plot(model, forecast, supplier_name)
    
    # Prepare forecast data
    forecast_data = forecast[['ds', 'yhat']].tail(periods).to_dict('records')
    
    return {
        "supplier": supplier_name,
        "plot_image": plot_image,
        "forecast_data": forecast_data,
        "status": "success"
    }
