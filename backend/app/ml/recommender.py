# ml/recommender.py
import pandas as pd
from sqlalchemy import create_engine
from sklearn.cluster import KMeans
from sklearn.preprocessing import OneHotEncoder
import numpy as np

class Recommender:
    def __init__(self, server, database, driver):
        self.server = server
        self.database = database
        self.driver = driver
        self.engine = self._create_engine()
        self.df_users = self._load_users_data()
        self.df_products = self._load_products_data()
        self.preference_features = ['interet_rec', 'objectif_cos', 'probleme_peau', 'preference_cos',
                                     'type_peau', 'type_cheveux', 'marque_tunisiennes_util',
                                     'pref_internationale', 'local_VS_inter', 'type_achat', 'critere_achat']
        self.n_preference_clusters = 5
        self.recommendations_preference_budget = self._generate_recommendations()

    def _create_engine(self):
        connection_string = f"mssql+pyodbc://@{self.server}/{self.database}?driver={self.driver}&trusted_connection=yes"
        return create_engine(connection_string)

    def _load_users_data(self):
        return pd.read_sql("SELECT * FROM dbo.Dim_rec", self.engine)

    def _load_products_data(self):
        return pd.read_sql("SELECT * FROM dbo.Dim_Products", self.engine)

    def _cluster_users_by_preference(self):
        df_users_preference = self.df_users[self.preference_features].fillna("Inconnu")
        encoder_preference = OneHotEncoder()
        user_encoded_preference = encoder_preference.fit_transform(df_users_preference).toarray()
        kmeans_preference = KMeans(n_clusters=self.n_preference_clusters, random_state=42)
        self.df_users['preference_cluster'] = kmeans_preference.fit_predict(user_encoded_preference)

    def _generate_recommendations(self):
        recommendations = {}
        self._cluster_users_by_preference()
        for preference_cluster_id in range(self.n_preference_clusters):
            user_group = self.df_users[self.df_users['preference_cluster'] == preference_cluster_id]
            budgets = user_group['budget'].dropna().unique()
            all_prices_for_cluster = pd.DataFrame()

            for budget_value in budgets:
                if budget_value == "Faible":
                    min_price = 0
                    max_price = 20
                elif budget_value == "Moyen":
                    min_price = 15
                    max_price = 50
                elif budget_value == "Élevé":
                    min_price = 40
                    max_price = float('inf')
                else:
                    min_price = 0
                    max_price = float('inf')

                budget_products = self.df_products[(self.df_products['Unit_Price'] >= min_price) & (self.df_products['Unit_Price'] <= max_price)]
                all_prices_for_cluster = pd.concat([all_prices_for_cluster, budget_products])

            unique_budget_products = all_prices_for_cluster.drop_duplicates(subset=['Product_PK'])

            if not unique_budget_products.empty:
                category_counts = user_group['Category_FK'].dropna().astype(int).value_counts()
                most_popular_categories = category_counts.index.tolist()
                cluster_recommendations = pd.DataFrame()
                for category_id in most_popular_categories:
                    category_budget_products = unique_budget_products[unique_budget_products['Category_FK'] == category_id]
                    if not category_budget_products.empty:
                        top_products = category_budget_products[['Product_PK', 'Product_Name', 'Brand_Name', 'Category_FK', 'Unit_Price']].head(2)
                        cluster_recommendations = pd.concat([cluster_recommendations, top_products])
                recommendations[preference_cluster_id] = cluster_recommendations.head(5)
            else:
                recommendations[preference_cluster_id] = pd.DataFrame(columns=['Product_Name', 'Brand_Name', 'Category_FK', 'Unit_Price'])
        return recommendations

    def get_recommendations_for_user(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id] # Assurez-vous que 'Rec_PK' est l'identifiant unique de l'utilisateur
        if not user.empty:
            preference_cluster = user.iloc[0]['preference_cluster']
            return self.recommendations_preference_budget.get(preference_cluster, pd.DataFrame(columns=['Product_Name', 'Brand_Name', 'Category_FK', 'Unit_Price']))
        return pd.DataFrame(columns=['Product_Name', 'Brand_Name', 'Category_FK', 'Unit_Price'])

    def get_user_budget(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id]
        if not user.empty:
            return user.iloc[0]['budget']
        return None

    def get_user_preference_cluster(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id]
        if not user.empty:
            return user.iloc[0]['preference_cluster']
        return None

    def get_cluster_profiles(self):
        profiles = {}
        for cluster_id in range(self.n_preference_clusters):
            cluster_users = self.df_users[self.df_users['preference_cluster'] == cluster_id]
            if not cluster_users.empty:
                profiles[cluster_id] = cluster_users[self.preference_features].mode().iloc[0].to_dict()
            else:
                profiles[cluster_id] = "Aucun utilisateur dans ce cluster."
        return profiles

    def close_connection(self):
        if self.engine:
            self.engine.dispose()