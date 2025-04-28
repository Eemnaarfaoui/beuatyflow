import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor(private http: HttpClient) {}

  getRecommendations() {
    return this.http.get<{ plot_image: string, recommendations: any[], total_products: number, analyzed_products: number }>('http://localhost:5000/ml/recommendations');
  }
}
