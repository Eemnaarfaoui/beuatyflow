# backend/app/ml/preferences.py
import pandas as pd
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import numpy as np
import os

class ModeleClassificationRF:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = None
        self.is_trained = False
        self.db_server = os.environ.get("DB_SERVER", "DESKTOP-CAV7GGJ\\MSSQLSERVERRR")
        self.db_name = os.environ.get("DB_NAME", "DW_FINALE")
        self.db_driver = os.environ.get("DB_DRIVER", "ODBC Driver 17 for SQL Server").replace(" ", "+")
        self.connection_string = f"mssql+pyodbc://{self.db_server}/{self.db_name}?driver={self.db_driver}"
        self.categorical_columns = ['sexe', 'type_peau', 'type_cheveux', 'marque_tunisiennes_conn',
                                    'marque_tunisiennes_util', 'pref_internationale', 'local_VS_inter',
                                    'type_achat', 'critere_achat', 'canal_achat', 'interet_app', 'profession',
                                    'secteur', 'region', 'interet_rec', 'objectif_cos', 'probleme_peau', 'ingredients_eviter']
        self.numerical_cols = ['age', 'salaire', 'budget', 'frequence_app', 'temp_moy_achat', 'niveau_fidelite']
        self._train_model() # Entraîner le modèle lors de l'initialisation

    def _connect_db(self):
        return create_engine(self.connection_string)

    def _load_data(self):
        engine = self._connect_db()
        query = """
        SELECT [Rec_PK], [Rec_ID], [interet_rec], [objectif_cos], [probleme_peau], [preference_cos],
        [type_peau], [type_cheveux], [budget], [frequence_app], [ingredients_eviter], [marque_tunisiennes_conn],
        [marque_tunisiennes_util], [pref_internationale], [local_VS_inter], [type_achat], [critere_achat], [canal_achat],
        [interet_app], [sexe], [age], [profession], [secteur], [salaire], [region], [temp_moy_achat], [niveau_fidelite],
        [Category_FK]
        FROM [DW_SupplyChain].[dbo].[Dim_rec]
        """
        df = pd.read_sql(query, engine)
        engine.dispose()
        return df.dropna()

    def _preprocess_data(self, df, is_training=True):
        for col in self.categorical_columns:
            df[col] = df[col].astype(str)
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            if is_training:
                df[col] = self.label_encoders[col].fit_transform(df[col])
            else:
                df[col] = df[col].apply(lambda x: self.label_encoders[col].transform([x])[0]
                                        if x in self.label_encoders[col].classes_ else -1)

        if 'preference_cos' in df.columns:
            df['preference_cos'] = df['preference_cos'].astype(str)
            if 'preference_cos' not in self.label_encoders:
                self.label_encoders['preference_cos'] = LabelEncoder()
            if is_training:
                df['preference_cos'] = self.label_encoders['preference_cos'].fit_transform(df['preference_cos'])
                print("LabelEncoder classes (preference_cos) during training:", self.label_encoders['preference_cos'].classes_)
            else:
                df['preference_cos'] = df['preference_cos'].apply(lambda x: self.label_encoders['preference_cos'].transform([x])[0]
                                                if x in self.label_encoders['preference_cos'].classes_ else -1)

        def transform_age(age):
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

        df['age'] = df['age'].apply(transform_age)

        def transform_budget(budget):
            if isinstance(budget, str) and 'K' in budget:
                return float(budget.replace('K', '').strip()) * 1000
            try:
                return float(budget)
            except:
                return None

        df['budget'] = df['budget'].apply(transform_budget)

        def transform_salaire(salaire):
            if isinstance(salaire, str):
                if 'Moins de 1 000 TND' in salaire: return 1000
                elif 'De 1 000 à 2 000 TND' in salaire: return 1500
                elif 'De 2 000 à 3 000 TND' in salaire: return 2500
                elif 'De 3 000 à 4 000 TND' in salaire: return 3500
                elif 'De 4 000 à 5 000 TND' in salaire: return 4500
                elif 'Plus de 5 000 TND' in salaire: return 5500
            try:
                return float(salaire.replace('TND', '').strip())
            except:
                return None

        df['salaire'] = df['salaire'].apply(transform_salaire)

        def transform_frequence_app(frequence):
            mapping = {'Jamais': 0, 'Occasionnellement': 1, 'Fréquemment': 2, 'Très fréquemment': 3}
            return mapping.get(frequence, None)

        df['frequence_app'] = df['frequence_app'].apply(transform_frequence_app)

        def transform_temp_moy_achat(temp):
            if isinstance(temp, str):
                if 'Plus de 15 minutes' in temp: return 16
                elif 'De 10 à 15 minutes' in temp: return 12.5
                elif 'De 5 à 10 minutes' in temp: return 7.5
                elif 'Moins de 5 minutes' in temp: return 4
            try:
                return float(temp)
            except:
                return None

        df['temp_moy_achat'] = df['temp_moy_achat'].apply(transform_temp_moy_achat)

        def transform_niveau_fidelite(niveau):
            mapping = {'Pas du tout fidèle': 0, 'Fidèle de temps en temps': 1, 'Modérément fidèle': 2, 'Très fidèle : j’achète toujours les mêmes marques': 3}
            return mapping.get(niveau, None)

        df['niveau_fidelite'] = df['niveau_fidelite'].apply(transform_niveau_fidelite)

        numerical_cols = ['age', 'budget', 'salaire', 'frequence_app', 'temp_moy_achat', 'niveau_fidelite']
        df_numerical = df[numerical_cols].fillna(df[numerical_cols].mean())

        if is_training:
            self.scaler = StandardScaler()
            df[numerical_cols] = self.scaler.fit_transform(df_numerical)
        elif self.scaler is not None:
            df[numerical_cols] = self.scaler.transform(df_numerical)

        return df

    def _train_model(self):
        df = self._load_data()
        df = self._preprocess_data(df, is_training=True)

        X = df.drop(['preference_cos', 'Rec_PK', 'Rec_ID', 'Category_FK'], axis=1) # Exclude Category_FK here
        y = df['preference_cos']

        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        self.is_trained = True
        print("Modèle Random Forest entraîné lors de l'initialisation.")
        print("Noms des colonnes utilisées pour l'entraînement :", list(X.columns))

    def predict(self, data):
        if not self.is_trained:
            raise Exception("Le modèle n'a pas été entraîné.")

        input_df = pd.DataFrame([data])
        input_df = self._preprocess_data(input_df, is_training=False)

        # Sélectionner uniquement les colonnes utilisées pour l'entraînement
        features_trained = list(self.label_encoders.keys())
        if 'preference_cos' in features_trained:
            features_trained.remove('preference_cos')
        if 'Category_FK' in features_trained: # Exclude Category_FK here as well
            features_trained.remove('Category_FK')

        # Ajouter les colonnes numériques manquantes avec des valeurs par défaut (ex: 0 ou moyenne)
        for col in self.numerical_cols:
            if col not in input_df.columns:
                input_df[col] = np.nan
        input_df[self.numerical_cols] = input_df[self.numerical_cols].fillna(pd.Series([input_df[c].mean() for c in self.numerical_cols], index=self.numerical_cols))

        # Ajouter les colonnes catégorielles manquantes (on ne peut pas vraiment les imputer de manière significative sans info)
        for col in self.categorical_columns:
            if col not in input_df.columns:
                input_df[col] = 'unknown' # Ou une autre valeur par défaut

        print("Noms des colonnes dans input_df pour la prédiction :", list(input_df.columns))
        print("Noms des colonnes attendues (features_trained + self.numerical_cols) :", features_trained + self.numerical_cols)

        # S'assurer que les colonnes sont dans le même ordre que lors de l'entraînement (si l'ordre est important pour le modèle)
        try:
            input_df = input_df[features_trained + self.numerical_cols]
        except KeyError as e:
            return {"error": f"Erreur: Colonne manquante dans les données de prédiction: {e}"}

        if self.scaler is not None and self.numerical_cols:
            input_df[self.numerical_cols] = self.scaler.transform(input_df[self.numerical_cols])

        # Encoder les colonnes catégorielles pour la prédiction
        for col in self.categorical_columns:
            if col in self.label_encoders:
                input_df[col] = input_df[col].astype(str)
                input_df[col] = input_df[col].apply(lambda x: self.label_encoders[col].transform([x])[0]
                                                if x in self.label_encoders[col].classes_ else -1)

        prediction = self.model.predict(input_df)
        if 'preference_cos' in self.label_encoders:
            try:
                decoded_preference = self.label_encoders['preference_cos'].inverse_transform(prediction)[0]
                return decoded_preference
            except ValueError as e:
                return {"error": f"Erreur lors du décodage de la prédiction: {e}, classes connues: {self.label_encoders['preference_cos'].classes_}, prediction: {prediction}"}
        else:
            return {"error": "LabelEncoder pour preference_cos non trouvé."}

if __name__ == '__main__':
    model = ModeleClassificationRF()
    example_data = {
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
        'budget': None,
        'salaire': 'De 2 000 à 3 000 TND',
        'frequence_app': 'Occasionnellement',
        'temp_moy_achat': 'De 5 à 10 minutes',
        'niveau_fidelite': 'Fidèle de temps en temps'
    }
    prediction = model.predict(example_data)
    print("Prédiction pour l'exemple:", prediction)