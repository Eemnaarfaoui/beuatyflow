from flask import  jsonify
from flask import jsonify, request
from sqlalchemy import text
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from flask import current_app
import pandas as pd
import numpy as np
import joblib
import os
import pandas as pd
from ..kpi_dash_funct import get_kpis

def init_kpi_routes(app):
    @app.route('/api/get-kpis', methods=['GET'])
    def get_kpis_values():
        try:
            kpis_values = get_kpis()
            return jsonify(kpis_values), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500


