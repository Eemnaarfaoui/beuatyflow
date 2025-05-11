from flask import request, session, Blueprint, jsonify, g
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
        self.preference_features = [
            'interet_rec', 'objectif_cos', 'probleme_peau', 'preference_cos',
            'type_peau', 'type_cheveux', 'marque_tunisiennes_util',
            'pref_internationale', 'local_VS_inter', 'type_achat', 'critere_achat'
        ]
        self.n_preference_clusters = 5
        self.recommendations_preference_budget = self._generate_recommendations()
        self.user_preferences = {}
        self.current_step_index = 0
        self.steps = self.preference_features + ['budget']
        self.questions = [
            "Quel est votre intérêt principal pour les produits cosmétiques ?",
            "Quel est votre objectif cosmétique ?",
            "Avez-vous des problèmes de peau spécifiques ?",
            "Préférez-vous des produits naturels, bio, classiques ?",
            "Quel est votre type de peau ?",
            "Quel est votre type de cheveux ?",
            "Utilisez-vous des marques tunisiennes ?",
            "Préférez-vous des marques internationales ?",
            "Préférez-vous acheter local ou international ?",
            "Quel type d'achat faites-vous habituellement (en ligne, en magasin...) ?",
            "Quel est votre critère principal d'achat (prix, qualité, marque...) ?",
            "Quel est votre budget (Faible, Moyen, Élevé) ?"
        ]
        self.questions_and_answers = {
            1: ["Oui, totalement", "Peut-être", "Non, pas nécessaire"],
            2: ["Améliorer la santé de ma peau/cheveux", "Me maquiller au quotidien", "Suivre les tendances beauté"],
            3: ["Hydratation", "Réduction des rides", "Éclat et uniformité du teint", "Traitement de l’acné et des imperfections", "Sensibilité et rougeurs", "Other…"],
            4: ["Naturels / Bio", "Avec des ingrédients scientifiquement testés", "Peu importe, tant que le produit est efficace"],
            5: ["Sèche", "Mixte", "Grasse", "Sensible", "Normale", "Je ne sais pas"],
            6: ["Secs", "Abîmés", "Gras", "Normaux", "Bouclés", "Frisés", "Fins", "Colorés"],
            7: ["Oui, j'adore", "Parfois", "Non, je préfère les marques internationales"],
            8: ["Oui, j'adore", "Parfois", "Non, je préfère les marques tunisiennes"],
            9: ["Local", "International", "Peu importe"],
            10: ["En ligne", "En magasin", "Peu importe"],
            11: ["Prix", "Qualité", "Marque", "Ingrédients", "Autre"],
            12: ["Faible", "Moyen", "Élevé"],
        }

    def _create_engine(self):
        connection_string = f"mssql+pyodbc://@{self.server}/{self.database}?driver={self.driver}&trusted_connection=yes"
        return create_engine(connection_string)

    def _load_users_data(self):
        return pd.read_sql("SELECT * FROM dbo.Dim_rec", self.engine)

    def _load_products_data(self):
        return pd.read_sql("SELECT * FROM dbo.Dim_Products", self.engine)

    def _cluster_users_by_preference(self):
        df_users_preference = self.df_users[self.preference_features].fillna("Inconnu")
        self.encoder = OneHotEncoder(handle_unknown='ignore')
        user_encoded = self.encoder.fit_transform(df_users_preference).toarray()

        self.kmeans = KMeans(n_clusters=self.n_preference_clusters, random_state=42)
        self.df_users['preference_cluster'] = self.kmeans.fit_predict(user_encoded)


    def _generate_recommendations(self):
        recommendations = {}
        self._cluster_users_by_preference()
        for cluster_id in range(self.n_preference_clusters):
            user_group = self.df_users[self.df_users['preference_cluster'] == cluster_id]
            budgets = user_group['budget'].dropna().unique()
            all_products = pd.DataFrame()

            for budget in budgets:
                if budget == "Faible":
                    min_price, max_price = 0, 20
                elif budget == "Moyen":
                    min_price, max_price = 15, 50
                elif budget == "Élevé":
                    min_price, max_price = 40, float('inf')
                else:
                    min_price, max_price = 0, float('inf')

                filtered = self.df_products[
                    (self.df_products['Unit_Price'] >= min_price) & 
                    (self.df_products['Unit_Price'] <= max_price)
                ]
                all_products = pd.concat([all_products, filtered])

            unique_products = all_products.drop_duplicates(subset='Product_PK')
            cluster_reco = pd.DataFrame()

            category_counts = user_group['Category_FK'].dropna().astype(int).value_counts()
            for cat_id in category_counts.index:
                candidates = unique_products[unique_products['Category_FK'] == cat_id]
                if not candidates.empty:
                    cluster_reco = pd.concat([cluster_reco, candidates.head(2)])
            recommendations[cluster_id] = cluster_reco.head(5)
        return recommendations

    def get_recommendations_for_user(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id]
        if not user.empty:
            cluster_id = user.iloc[0]['preference_cluster']
            return self.recommendations_preference_budget.get(cluster_id, pd.DataFrame())
        return pd.DataFrame()

    def get_user_budget(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id]
        return user.iloc[0]['budget'] if not user.empty else None

    def get_user_preference_cluster(self, user_id):
        user = self.df_users[self.df_users['Rec_PK'] == user_id]
        return user.iloc[0]['preference_cluster'] if not user.empty else None

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

    def get_question_answers(self, question_id):
        return self.questions_and_answers.get(question_id, [])


    def start_chat(self):
        self.user_preferences = {}
        self.current_step_index = 0
        question = self.questions[self.current_step_index]
        options = self.get_question_answers(self.current_step_index)
        return question, options

    def handle_message(self, message, current_step_index, user_preferences):
        if current_step_index >= len(self.steps):
            return "Vous avez déjà terminé le questionnaire.", current_step_index, user_preferences

        # Enregistrez la réponse de l'utilisateur
        user_preferences[self.steps[current_step_index]] = message
        next_index = current_step_index + 1

        if next_index < len(self.questions):
            # Si on n'a pas encore atteint la dernière question
            return self.questions[next_index], next_index, user_preferences
        else:
            # Traitement à la fin du questionnaire
            self.user_preferences = user_preferences
            recommendations = self._recommend_from_preferences()

            if not recommendations.empty:
                result = recommendations[['Product_Name', 'Brand_Name', 'Unit_Price']].head(5)
                lines = [
                    f"- {row['Product_Name']} ({row['Brand_Name']}) - {row['Unit_Price']} TND"
                    for _, row in result.iterrows()
                ]
                return "Voici vos recommandations :\n" + "\n".join(lines), next_index, user_preferences
            else:
                return "Désolé, aucun produit ne correspond à vos préférences.", next_index, user_preferences

    def _recommend_from_preferences(self):
        if not self.user_preferences:
            return pd.DataFrame()

        user_input_df = pd.DataFrame([self.user_preferences])[self.preference_features]
        encoded_input = self.encoder.transform(user_input_df).toarray()
        cluster_id = self.kmeans.predict(encoded_input)[0]

        return self.recommendations_preference_budget.get(cluster_id, pd.DataFrame())

    def get_preferences(self):
        return self.user_preferences
    



