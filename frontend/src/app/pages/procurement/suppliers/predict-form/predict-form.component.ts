import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-predict-form',
  templateUrl: './predict-form.component.html',
  styleUrls: ['./predict-form.component.css']
})
export class PredictFormComponent implements OnInit {
  formData = {
    Frequence_Achat: null,
    Volume_Total_Quantite: null,
    Date_Dernier_Achat: '',
    Diversite_Produits: null
  };
  predictionResult: number | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Optional: Initialization logic here
  }

  predictReliability() {
    this.http.post<any>('http://127.0.0.1:5000/ml/predict_reliability', this.formData)
      .subscribe(
        response => {
          this.predictionResult = response.predicted_reliability_score;
          this.errorMessage = null;
        },
        error => {
          this.errorMessage = error.error.error || 'Erreur lors de la prédiction.';
          this.predictionResult = null;
        }
      );
  }
}