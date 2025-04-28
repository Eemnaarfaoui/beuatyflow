import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ex-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ex_products.html',
})
export class ExProductsComponent implements OnInit {
  plotImage: string = '';
  criticalProducts: any[] = [];
  loaded: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCriticalProducts();
  }

  fetchCriticalProducts() {
    this.http.get<any>('http://localhost:5000/ml/anomalies').subscribe({
      next: (response) => {
        this.plotImage = response.plot_image || '';
        this.criticalProducts = response.critical_products || [];
        this.loaded = true;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Erreur lors du chargement des anomalies', error);
        this.errorMessage = 'Erreur lors du chargement des anomalies : ' + (error.message || 'Inconnue');
        this.loaded = true;
      }
    });
  }
}
