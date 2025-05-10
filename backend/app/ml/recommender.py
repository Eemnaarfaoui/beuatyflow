# backend/ml/recommender.py
import pandas as pd
from sqlalchemy import create_engine
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder
import numpy as np
from collections import Counter

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
        self.steps = [
            'interet_rec', 'objectif_cos', 'probleme_peau', 'preference_cos',
            'type_peau', 'type_cheveux', 'marque_tunisiennes_util', 'pref_internationale',
            'local_VS_inter', 'type_achat', 'critere_achat', 'budget'
        ]
        self.questions = [
            "Quel est votre intérêt principal en matière de recommandation de produits?",
            "Quel est votre objectif cosmétique principal?",
            "Avez-vous des problèmes de peau spécifiques?",
            "Quelle est votre préférence en matière de cosmétiques?",
            "Quel est votre type de peau?",
            "Quel est votre type de cheveux?",
            "Utilisez-vous des marques tunisiennes? Si oui, lesquelles?",
            "Préférez-vous les marques internationales?",
            "Préférez-vous les produits locaux ou internationaux?",
            "Quel est votre type d'achat?",
            "Quel est votre critère d'achat principal?",
            "Quel est votre budget? (Faible, Moyen, Élevé)"
        ]
        self.encoder = None # Initialiser l'encodeur

    def _create_engine(self):
        """Crée le moteur de connexion à la base de données."""
        connection_string = f"mssql+pyodbc://@{self.server}/{self.database}?driver={self.driver}&trusted_connection=yes"
        return create_engine(connection_string)

    def _load_users_data(self):
        """Charge les données des utilisateurs depuis la base de données."""
        return pd.read_sql("SELECT * FROM dbo.Dim_rec", self.engine)

    def _load_products_data(self):
        """Charge les données des produits depuis la base de données."""
        return pd.read_sql("SELECT * FROM dbo.Dim_Products", self.engine)

    def handle_message(self, message, current_step_index, user_preferences):
        """Gère la réponse de l'utilisateur et détermine la prochaine étape."""
        step = self.steps[current_step_index]
        user_preferences[step] = message
        next_step_index = current_step_index + 1

        if next_step_index < len(self.questions):
            response = self.questions[next_step_index]
            return response, next_step_index, user_preferences
        else:
            recommendations = self._recommend_products_from_responses(user_preferences)
            return recommendations, next_step_index, user_preferences

    def _encode_preferences(self, data):
        """Encode les préférences d'un utilisateur unique."""
        df = pd.DataFrame([data])[self.preference_features].fillna("Inconnu")
        if self.encoder is None:
            self.encoder = OneHotEncoder(handle_unknown='ignore')
            encoded_data = self.encoder.fit_transform(df).toarray()
        else:
            encoded_data = self.encoder.transform(df).toarray()
        return encoded_data

    def _encode_all_user_preferences(self):
        """Encode les préférences de tous les utilisateurs."""
        all_users_preferences = self.df_users[self.preference_features].fillna("Inconnu")
        if self.encoder is None:
            self.encoder = OneHotEncoder(handle_unknown='ignore')
            encoded_all_users = self.encoder.fit_transform(all_users_preferences).toarray()
        else:
            encoded_all_users = self.encoder.transform(all_users_preferences).toarray()
        return encoded_all_users

    def _recommend_products_from_responses(self, user_preferences):
        """Recommande des produits en fonction des préférences de l'utilisateur."""
        user_encoded_preferences = self._encode_preferences(user_preferences)
        encoded_all_users = self._encode_all_user_preferences()

        if encoded_all_users.shape[0] > 0:
            similarities = cosine_similarity(user_encoded_preferences, encoded_all_users)[0]
            similar_user_indices = np.argsort(similarities)[::-1]
        else:
            print("Avertissement : Aucune donnée utilisateur disponible pour le calcul de similarité.")
            similar_user_indices = []

        print("Préférences Utilisateur Encodées :", user_encoded_preferences)
        print("Similarités :", similarities if encoded_all_users.shape[0] > 0 else "N/A")
        print("Indices Utilisateurs Similaires :", similar_user_indices)

        recommended_products = pd.DataFrame()
        budget = user_preferences.get('budget')
        print("Budget Utilisateur :", budget)

        min_price, max_price = 0, float('inf')
        if budget == "Faible":
            max_price = 35  # Élargissement léger
        elif budget == "Moyen":
            min_price = 25  # Élargissement léger
            max_price = 90  # Élargissement léger
        elif budget == "Élevé":
            min_price = 70

        top_n = min(10, len(similar_user_indices)) # Considérer plus d'utilisateurs similaires
        for index in similar_user_indices[:top_n]:
            try:
                similar_user = self.df_users.iloc[index]
                purchase_history = similar_user['Purchase_History']
                if pd.notna(purchase_history):
                    product_ids = purchase_history.split(',')
                    favorite_categories = self.df_products[self.df_products['Product_PK'].isin(product_ids)]['Category_FK'].value_counts().nlargest(5).index.tolist() # Considérer plus de catégories
                    print(f"Utilisateur Similaire {index} - Catégories Favorites :", favorite_categories)
                    for category_fk in favorite_categories:
                        category_products = self.df_products[
                            (self.df_products['Category_FK'] == category_fk) &
                            (self.df_products['Unit_Price'] >= min_price) &
                            (self.df_products['Unit_Price'] <= max_price)
                        ].head(3) # Prendre plus de produits par catégorie
                        print(f"Produits Catégorie {category_fk} :", category_products)
                        recommended_products = pd.concat([recommended_products, category_products])
            except IndexError:
                print(f"Avertissement : Index {index} hors limites pour df_users.")
                continue

        recommended_products = recommended_products.drop_duplicates(subset=['Product_PK'])

        if recommended_products.empty:
            print("Aucune recommandation basée sur des utilisateurs similaires. Essai avec les produits populaires dans le budget (élargi).")
            min_price_relaxed = max(0, min_price - 15) # Élargissement plus important
            max_price_relaxed = max_price + 15 # Élargissement plus important
            popular_categories_in_budget = self.df_products[
                (self.df_products['Unit_Price'] >= min_price_relaxed) &
                (self.df_products['Unit_Price'] <= max_price_relaxed)
            ]['Category_FK'].value_counts().nlargest(7).index.tolist() # Considérer plus de catégories populaires
            print("Catégories Populaires dans le Budget (Élargi) :", popular_categories_in_budget)
            for category_fk in popular_categories_in_budget:
                category_products = self.df_products[
                    (self.df_products['Category_FK'] == category_fk) &
                    (self.df_products['Unit_Price'] >= min_price_relaxed) &
                    (self.df_products['Unit_Price'] <= max_price_relaxed)
                ].head(3) # Prendre plus de produits par catégorie populaire
                print(f"Produits Catégorie Populaire {category_fk} :", category_products)
                recommended_products = pd.concat([recommended_products, category_products])
            recommended_products = recommended_products.drop_duplicates(subset=['Product_PK'])

        if recommended_products.empty:
            print("Aucune recommandation trouvée. Retour des produits les plus récents.")
            # Logique de recommandation par défaut : les produits les plus récents
            most_recent_products = self.df_products.sort_values(by='Product_PK', ascending=False).head(5)
            final_recommendations = most_recent_products[['Product_Name', 'Brand_Name', 'Unit_Price']]
        else:
            final_recommendations = recommended_products[['Product_Name', 'Brand_Name', 'Unit_Price']].head(5)

        print("Recommandations Finales :", final_recommendations)
        return final_recommendations



    def close_connection(self):
        """Ferme la connexion à la base de données."""
        if self.engine:
            self.engine.dispose()