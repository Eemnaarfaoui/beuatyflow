import pandas as pd
import numpy as np
from sklearn.linear_model import PoissonRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import pyodbc

from ..data_fetcher import get_db_connection

class TimeSeriesLinearRegression:
    def __init__(self, 
                 date_column='fulldate', 
                 target_column='quantity', 
                 segment_columns=['shop_id', 'category_name']):
        """
        Initialize Time Series Linear Regression Forecaster
        
        Parameters:
        - date_column: Name of the date column
        - target_column: Name of the target variable
        - segment_columns: Columns used for segmentation
        """
        self.date_column = date_column
        self.target_column = target_column
        self.segment_columns = segment_columns
        
        # Storage for models and results
        self.models = {}
        self.scalers = {}
        self.performance_metrics = {}
    
    def save_model(self, forecaster, model_path='predicting_sales_model.pkl'):
        """
        Save the forecaster, models, scalers, and performance metrics to a file.
        
        Parameters:
        - forecaster: The TimeSeriesLinearRegression object containing the models, scalers, etc.
        - model_path: The path to the file where the model will be saved.
        """
        model_data = {
            'model': forecaster.models,
            'scalers': forecaster.scalers,
            'performance_metrics': forecaster.performance_metrics
        }
        
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
    
    def _create_time_features(self, df):
        """
        Create time-based features
        
        Parameters:
        - df: Input dataframe
        
        Returns:
        - Dataframe with additional time features
        """
        df[self.date_column] = pd.to_datetime(df[self.date_column])
        
        df['days_since_start'] = (df[self.date_column] - df[self.date_column].min()).dt.days
        df['month'] = df[self.date_column].dt.month
        df['day_of_week'] = df[self.date_column].dt.dayofweek
        df['quarter'] = df[self.date_column].dt.quarter
        
        df['sin_day'] = np.sin(df['day_of_week'] * (2 * np.pi / 7))
        df['cos_day'] = np.cos(df['day_of_week'] * (2 * np.pi / 7))
        df['sin_month'] = np.sin(df['month'] * (2 * np.pi / 12))
        df['cos_month'] = np.cos(df['month'] * (2 * np.pi / 12))
        
        return df
    
    def _create_lag_features(self, df, lags=3):
        """
        Create lag features with improved handling
        
        Parameters:
        - df: Input dataframe
        - lags: Number of lag periods
        
        Returns:
        - Dataframe with lag features
        """
        df = df.reset_index(drop=True)
        grouped = df.groupby(self.segment_columns)
        
        for lag in range(1, lags + 1):
            df[f'lag_{lag}'] = grouped[self.target_column].transform(lambda x: x.shift(lag))
        
        df[f'rolling_mean_{lags}'] = grouped[self.target_column].transform(
            lambda x: x.rolling(window=lags, min_periods=1).mean()
        )
        df[f'rolling_std_{lags}'] = grouped[self.target_column].transform(
            lambda x: x.rolling(window=lags, min_periods=1).std()
        )
        
        return df.fillna(0)
    
    def prepare_features(self, df):
        """
        Prepare features for modeling with improved error handling
        
        Parameters:
        - df: Input dataframe
        
        Returns:
        - Prepared dataframe with features
        """
        try:
            df = df.sort_values(self.segment_columns + [self.date_column])
            df = df.reset_index(drop=True)
            
            df = self._create_time_features(df)
            df = self._create_lag_features(df)
            
            return df
        except Exception as e:
            print(f"Error in feature preparation: {e}")
            raise
    
    def train_model(self, df):
        """
        Train linear regression models for each segment
        
        Parameters:
        - df: Input dataframe
        
        Returns:
        - Dictionary of trained models and metrics
        """
        try:
            df_featured = self.prepare_features(df)
            
            segments = df_featured.groupby(self.segment_columns).size().reset_index()
            
            results = {}
            
            for _, segment_row in segments.iterrows():
                segment_filter = pd.Series(True, index=df_featured.index)
                for col in self.segment_columns:
                    segment_filter &= (df_featured[col] == segment_row[col])
                segment_data = df_featured[segment_filter]
                
                feature_columns = [
                    'days_since_start', 'month', 'day_of_week', 'quarter',
                    'sin_day', 'cos_day', 'sin_month', 'cos_month',
                    'lag_1', 'lag_2', 'lag_3',
                    'rolling_mean_3', 'rolling_std_3'
                ]
                
                available_features = [col for col in feature_columns if col in segment_data.columns]
                
                X = segment_data[available_features]
                y = segment_data[self.target_column]
                
                if len(X) < 10:
                    print(f"Insufficient data for segment: {segment_row}")
                    continue
                
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
                
                scaler = StandardScaler()
                X_train_scaled = scaler.fit_transform(X_train)
                X_test_scaled = scaler.transform(X_test)
                
                model = PoissonRegressor()
                model.fit(X_train_scaled, y_train)
                
                y_pred_train = model.predict(X_train_scaled)
                y_pred_test = model.predict(X_test_scaled)
                
                metrics = {
                    'train_mse': mean_squared_error(y_train, y_pred_train),
                    'test_mse': mean_squared_error(y_test, y_pred_test),
                    'train_r2': r2_score(y_train, y_pred_train),
                    'test_r2': r2_score(y_test, y_pred_test)
                }
                
                segment_key = tuple(segment_row[self.segment_columns])
                self.models[segment_key] = model
                self.scalers[segment_key] = scaler
                self.performance_metrics[segment_key] = metrics
                
                results[segment_key] = {
                    'model': model,
                    'scaler': scaler,
                    'metrics': metrics
                }
            
            return results
        except Exception as e:
            print(f"Error in train_model: {e}")
            raise
    
    def forecast(self, df, forecast_horizon=365):
        df_featured = self.prepare_features(df)
        last_date = df[self.date_column].max()
        
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        all_forecasts = []
        
        for segment_key, model in self.models.items():
            forecast_df = pd.DataFrame({self.date_column: forecast_dates})
            for col, val in zip(self.segment_columns, segment_key):
                forecast_df[col] = val
            forecast_df[self.target_column] = 0
            
            forecast_df = self.prepare_features(forecast_df)
            
            feature_columns = [
                'days_since_start', 'month', 'day_of_week', 'quarter',
                'sin_day', 'cos_day', 'sin_month', 'cos_month',
                'lag_1', 'lag_2', 'lag_3',
                'rolling_mean_3', 'rolling_std_3'
            ]
            
            available_features = [col for col in feature_columns if col in forecast_df.columns]
            
            scaler = self.scalers[segment_key]
            X_forecast = forecast_df[available_features]
            
            X_forecast_scaled = scaler.transform(X_forecast)
            forecast_df[self.target_column] = np.round(model.predict(X_forecast_scaled)).astype(int)
            
            all_forecasts.append(forecast_df)
        
        full_forecast = pd.concat(all_forecasts)
        
        return full_forecast

def run_time_series_forecast(df):
    forecaster = TimeSeriesLinearRegression()
    model_results = forecaster.train_model(df)
    forecasts = forecaster.forecast(df)
    
    return {
        'forecaster': forecaster,
        'models': model_results,
        'forecasts': forecasts
    }

def fetch_sales_data():
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
        conn = get_db_connection()  # You need to implement get_db_connection
        data = pd.read_sql(query, conn)
        conn.close()
        
        if data.empty:
            raise ValueError("No data fetched from database")
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise
