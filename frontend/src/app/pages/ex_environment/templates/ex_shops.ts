import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface ForecastItem {
  ds: string;
  yhat: number;
}

interface ForecastResult {
  supplier: string;
  plot_image: string;
  forecast_data: ForecastItem[];
  status: string;
  error?: string;
}

@Component({
  selector: 'app-ex-env-shops',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Supplier Price Forecasts</h1>
    
    <div *ngIf="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-2">Loading forecasts...</p>
    </div>
    
    <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let result of forecasts" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ result.supplier }}</h2>
          
          <div *ngIf="result.status === 'success'">
            <img [src]="'data:image/png;base64,' + result.plot_image" 
                 alt="Price forecast" 
                 class="w-full h-auto mb-4">
            
            <h3 class="text-lg font-medium text-gray-700 mb-2">Price Forecast (TND)</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let item of result.forecast_data">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {{ item.ds | date:'mediumDate' }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {{ item.yhat | number:'1.2-2' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div *ngIf="result.status === 'error'" class="bg-red-50 border-l-4 border-red-500 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ result.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: []
})
export class ExEnvShopsComponent implements OnInit {
  loading = true;
  errorMessage = '';
  forecasts: ForecastResult[] = [];
  
  // Default suppliers - could also be made configurable via inputs
  private defaultSuppliers = [
    'Essentiels du Sahara (Tozeur, Tunisia)',
    'Ingrédients de Carthage (Tunis, Tunisia)',
    'Extraits Tunisiens (Tunis, Tunisia)'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadForecasts();
  }

  loadForecasts() {
    this.loading = true;
    this.errorMessage = '';
    
    // Build query parameters for the suppliers
    const params = this.defaultSuppliers
      .map(supplier => `supplier=${encodeURIComponent(supplier)}`)
      .join('&');
    
    this.http.get<ForecastResult[]>(`http://localhost:5000/ml/forecast?${params}`).subscribe({
      next: (results) => {
        this.forecasts = results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load forecasts:', err);
        this.errorMessage = 'Failed to load supplier forecasts. Please try again later.';
        this.loading = false;
      }
    });
  }
}