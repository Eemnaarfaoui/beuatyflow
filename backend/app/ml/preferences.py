import pandas as pd
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import numpy as np
# import joblib # Pour sauvegarder et charger le modèle (optionnel)

class ModeleClassificationRF:
    def __init__(self):
        # Infos de connexion (à configurer via des variables d'environnement en production)
        self.server = "DESKTOP-CAV7GGJ\MSSQLSERVERRR"
        self.database = "DW_FINALE"
        self.driver = "ODBC Driver 17 for SQL Server"
        self.connection_string = f"mssql+pyodbc://{self.server}/{self.database}?driver={self.driver.replace(' ', '+')}"
        self.engine = create_engine(self.connection_string)
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.numerical_imputer = SimpleImputer(strategy='mean') # Vous pouvez choisir 'median', 'most_frequent', etc.
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.categorical_columns = ['sexe', 'type_peau', 'type_cheveux', 'marque_tunisiennes_conn',
                                    'marque_tunisiennes_util', 'pref_internationale', 'local_VS_inter',
                                    'type_achat', 'critere_achat', 'canal_achat', 'interet_app', 'profession',
                                    'secteur', 'region', 'interet_rec', 'objectif_cos', 'probleme_peau', 'ingredients_eviter']
        self.numerical_columns = ['age', 'salaire', 'frequence_app', 'temp_moy_achat', 'niveau_fidelite'] # 'budget' retiré
        self.is_trained = False

    def _load_data(self):
        query = """
        SELECT TOP 1000 [Rec_PK], [Rec_ID], [interet_rec], [objectif_cos], [probleme_peau], [preference_cos],
        [type_peau], [type_cheveux], [budget], [frequence_app], [ingredients_eviter], [marque_tunisiennes_conn],
        [marque_tunisiennes_util], [pref_internationale], [local_VS_inter], [type_achat], [critere_achat], [canal_achat],
        [interet_app], [sexe], [age], [profession], [secteur], [salaire], [region], [temp_moy_achat], [niveau_fidelite],
        [Category_FK]
        FROM [DW_SupplyChain].[dbo].[Dim_rec]
        """
        df = pd.read_sql(query, self.engine)
        return df.dropna(subset=self.categorical_columns, how='all') # Supprimer les lignes où toutes les colonnes catégorielles sont NaN

    def _preprocess_data(self, df):
        print(f"Taille avant encodage catégoriel: {len(df)}")
        for col in self.categorical_columns:
            if col in df.columns:
                df[col] = df[col].fillna('unknown').astype(str)
                df[col] = self.label_encoder.fit_transform(df[col])
        print(f"Taille après encodage catégoriel: {len(df)}")

        if 'preference_cos' in df.columns and not self.is_trained:
            df['preference_cos'] = self.label_encoder.fit_transform(df['preference_cos'].astype(str))
        print(f"Taille après encodage de la cible (si applicable): {len(df)}")

        df['age'] = df['age'].apply(self._transform_age)
        df['budget'] = df['budget'].apply(self._transform_budget)
        df['salaire'] = df['salaire'].apply(self._transform_salaire)
        df['frequence_app'] = df['frequence_app'].apply(self._transform_frequence_app)
        df['temp_moy_achat'] = df['temp_moy_achat'].apply(self._transform_temp_moy_achat)
        df['niveau_fidelite'] = df['niveau_fidelite'].apply(self._transform_niveau_fidelite)
        print(f"Taille après transformations numériques: {len(df)}")

        numerical_cols_present = [col for col in self.numerical_columns if col in df.columns]

        # Vérifier si des colonnes numériques sont présentes pour l'imputation
        if numerical_cols_present:
            try:
                df[numerical_cols_present] = self.numerical_imputer.fit_transform(df[numerical_cols_present])
                print(f"Taille après imputation des NaN numériques: {len(df)}")
            except ValueError as e:
                print(f"Erreur lors de l'imputation : {e}")
                print(f"Colonnes numériques présentes pour l'imputation : {numerical_cols_present}")
                # Inspecter le DataFrame à ce stade pour comprendre la forme
                print(df[numerical_cols_present].head())

        columns_to_scale = numerical_cols_present
        if columns_to_scale:
            df[columns_to_scale] = self.scaler.fit_transform(df[columns_to_scale])
        print(f"Taille juste avant la normalisation: {len(df)}")
        return df

    def _transform_age(self, age):
        if isinstance(age, str):
            if '18 - 24 ans' in age: return 21
            elif '25 - 34 ans' in age: return 29
            elif '35 - 44 ans' in age: return 39
            elif '45 - 54 ans' in age: return 49
            elif '55 - 64 ans' in age: return 59
            elif '65 ans et plus' in age: return 70
            elif '45 ans et plus' in age: return 55
        try:
            return float(age)
        except:
            return None

    def _transform_budget(self, budget):
        if isinstance(budget, str) and 'K' in budget:
            return float(budget.replace('K', '').strip()) * 1000
        try:
            return float(budget)
        except:
            return None

    def _transform_salaire(self, salaire):
        print(f"Transformation salaire : {salaire}")
        if pd.isna(salaire): # Gérer les valeurs None/NaN explicites
            return None
        if isinstance(salaire, str):
            salaire = salaire.strip() # Supprimer les espaces autour
            if 'Moins de 1 000 TND' == salaire: return 1000
            elif 'De 1 000 à 2 000 TND' in salaire or '1 000 – 2 500 TND' == salaire: return 1750 # Gérer les différentes formes
            elif 'De 2 000 à 3 000 TND' in salaire: return 2500
            elif 'De 3 000 à 4 000 TND' in salaire: return 3500
            elif 'De 4 000 à 5 000 TND' in salaire: return 4500
            elif 'Plus de 5 000 TND' == salaire: return 5500
            try:
                return float(salaire.replace('TND', '').replace(' ', '')) # Supprimer 'TND' et les espaces pour la conversion directe
            except ValueError:
                return None # Si la conversion échoue toujours
        try:
            return float(salaire)
        except:
            return None

    def _transform_frequence_app(self, frequence):
        mapping = {'Jamais': 0, 'Occasionnellement': 1, 'Fréquemment': 2, 'Très fréquemment': 3}
        return mapping.get(frequence, None)

    def _transform_temp_moy_achat(self, temp):
        if isinstance(temp, str):
            if 'Plus de 15 minutes' in temp: return 16
            elif 'De 10 à 15 minutes' in temp: return 12.5
            elif 'De 5 à 10 minutes' in temp: return 7.5
            elif 'Moins de 5 minutes' in temp: return 4
        try:
            return float(temp)
        except:
            return None

    def _transform_niveau_fidelite(self, niveau):
        mapping = {'Pas du tout fidèle': 0, 'Fidèle de temps en temps': 1, 'Modérément fidèle': 2,
                   'Très fidèle : j’achète toujours les mêmes marques': 3}
        return mapping.get(niveau, None)

    def train(self):
        df = self._load_data()
        print(f"Taille du DataFrame après le chargement : {len(df)}")
        df_processed = self._preprocess_data(df.copy()) # Passer une copie pour éviter les modifications inattendues
        X = df_processed.drop(['preference_cos', 'Rec_PK', 'Rec_ID'], axis=1, errors='ignore')
        y = df_processed['preference_cos']
        # Vérifier si X et y ne sont pas vides avant de diviser les données
        if not X.empty and not y.empty:
            X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)
            self.model.fit(X_train, y_train)
            self.is_trained = True
        else:
            print("Avertissement : Impossible d'entraîner le modèle car les données après le prétraitement sont vides.")
        # joblib.dump(self.model, 'modele_rf.joblib') # Optionnel: sauvegarder le modèle

    def predict(self, data):
        if not self.is_trained:
            self.train() # S'assurer que le modèle est entraîné avant de prédire
            # self.model = joblib.load('modele_rf.joblib') # Optionnel: charger le modèle

        input_df = pd.DataFrame([data])
        # Encoder et normaliser les nouvelles données en utilisant les mêmes transformateurs
        for col in self.categorical_columns:
            if col in input_df.columns:
                input_df[col] = input_df[col].fillna('unknown').astype(str)
                # Il faudrait potentiellement fitter le label encoder sur toutes les données vues lors de l'entraînement
                # Pour une prédiction unique, on peut simplement transformer si la catégorie existe
                if input_df[col].iloc[0] in self.label_encoder.classes_:
                    input_df[col] = self.label_encoder.transform([input_df[col].iloc[0]])[0]
                else:
                    # Gérer le cas où la catégorie n'a pas été vue lors de l'entraînement
                    input_df[col] = self.label_encoder.transform(['unknown'])[0] # Utiliser 'unknown' ou une autre stratégie

        input_df['age'] = input_df['age'].apply(self._transform_age)
        input_df['budget'] = input_df['budget'].apply(self._transform_budget)
        input_df['salaire'] = input_df['salaire'].apply(self._transform_salaire)
        input_df['frequence_app'] = input_df['frequence_app'].apply(self._transform_frequence_app)
        input_df['temp_moy_achat'] = input_df['temp_moy_achat'].apply(self._transform_temp_moy_achat)
        input_df['niveau_fidelite'] = input_df['niveau_fidelite'].apply(self._transform_niveau_fidelite)

        # Sélectionner uniquement les colonnes numériques présentes et imputer les valeurs manquantes
        numerical_cols_present = [col for col in self.numerical_columns if col in input_df.columns]
        if numerical_cols_present:
            input_df[numerical_cols_present] = self.numerical_imputer.transform(input_df[numerical_cols_present])

        # Sélectionner uniquement les colonnes utilisées pour l'entraînement et gérer les manquantes
        training_columns = list(self.model.feature_names_in_)
        input_df = input_df.reindex(columns=training_columns, fill_value=0) # Ajouter les colonnes manquantes avec 0

        # Normalisation (appliquer la transformation apprise sur les données d'entraînement)
        numerical_cols_to_scale = [col for col in self.numerical_columns if col in training_columns]
        if numerical_cols_to_scale:
            # Sélectionner uniquement les colonnes numériques pour la normalisation
            input_df[numerical_cols_to_scale] = self.scaler.transform(input_df[numerical_cols_to_scale])

        prediction = self.model.predict(input_df)
        # Inversement encoder la prédiction pour obtenir la catégorie d'origine
        return self.label_encoder.inverse_transform(prediction)[0]

if __name__ == '__main__':
    modele = ModeleClassificationRF()
    modele.train()
    # Exemple de données pour la prédiction (doit correspondre aux features utilisées par le modèle)
    nouvelles_donnees = {
        'sexe': 'Homme',
        'type_peau': 'Grasse',
        'type_cheveux': 'Gras',
        'marque_tunisiennes_conn': 'Oui',
        'marque_tunisiennes_util': 'Non',
        'pref_internationale': 'Oui',
        'local_VS_inter': 'International',
        'type_achat': 'En ligne',
        'critere_achat': 'Prix',
        'canal_achat': 'Site web',
        'interet_app': 'Oui',
        'profession': 'Ingénieur',
        'secteur': 'IT',
        'region': 'Tunis',
        'interet_rec': 'Oui',
        'objectif_cos': 'Hydratation',
        'probleme_peau': 'Acné',
        'ingredients_eviter': 'Parabènes',
        'age': '25 - 34 ans',
        'frequence_app': 'Occasionnellement',
        'salaire': 'De 2 000 à 3 000 TND',
        'temp_moy_achat': 'De 5 à 10 minutes',
        'niveau_fidelite': 'Fidèle de temps en temps'
        # 'budget': '500' # Supprimé de les features utilisées par le modèle
    }
    print(modele.predict(nouvelles_donnees))