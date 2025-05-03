import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ForecastItem {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ForecastResult {
  supplier: string;
  plot_image: string;
  forecast_data: ForecastItem[];
  status: string;
  error?: string;
  last_updated?: string;
}

@Component({
  selector: 'app-ex-env-shops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Supplier Price Forecasts</h1>
        <p class="mt-2 text-gray-600">Predictive analysis of future price trends from key suppliers</p>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-700 font-medium">Generating price forecasts...</p>
        <p class="text-sm text-gray-500 mt-1">This may take a few moments</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 rounded-md p-4 mb-8">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Forecast loading error</h3>
            <div class="mt-1 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="forecasts.length > 0" class="space-y-6">
        <!-- Stats Summary -->
        

        <!-- Forecast Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let result of filteredForecasts" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            <!-- Card Header -->
           
            
            <!-- Card Content -->
            <div class="p-5">
              <!-- Success Case -->
              <div *ngIf="result.status === 'success'">
                <!-- Forecast Chart -->
                <div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <img [src]="'data:image/png;base64,' + result.plot_image" 
                      alt="Price forecast" 
                      class="w-full h-auto">
                </div>
                
                <!-- Forecast Summary -->
                <div class="mb-4">
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-blue-50 p-2 rounded">
                      <p class="text-xs text-blue-600">Lowest</p>
                      <p class="font-medium">{{ getMinForecast(result.forecast_data) | number:'1.2-2' }} TND</p>
                    </div>
                    <div class="bg-green-50 p-2 rounded">
                      <p class="text-xs text-green-600">Average</p>
                      <p class="font-medium">{{ getAverageForecast(result.forecast_data) | number:'1.2-2' }} TND</p>
                    </div>
                    <div class="bg-purple-50 p-2 rounded">
                      <p class="text-xs text-purple-600">Highest</p>
                      <p class="font-medium">{{ getMaxForecast(result.forecast_data) | number:'1.2-2' }} TND</p>
                    </div>
                  </div>
                </div>
                
                <!-- Forecast Table -->
                <div class="overflow-hidden">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Detailed Forecast (TND)</h3>
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let item of result.forecast_data">
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {{ item.ds | date:'shortDate' }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ item.yhat | number:'1.2-2' }}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {{ item.yhat_lower | number:'1.2-2' }} - {{ item.yhat_upper | number:'1.2-2' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <!-- Error Case -->
              <div *ngIf="result.status === 'error'" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700">{{ result.error || 'Unknown error occurred during forecasting' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Card Footer -->
            <div class="bg-gray-50 px-5 py-3 border-t border-gray-200 text-right">
              
            </div>
          </div>
        </div>
        
        <!-- No Results Message -->
        <div *ngIf="filteredForecasts.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                No forecasts match your current filters. Try adjusting your criteria.
              </p>
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
  filteredForecasts: ForecastResult[] = [];
  lastUpdatedDate: Date = new Date();
  
  // Filtering properties
  statusFilter: string = 'all';
  
  // Default suppliers (from your image)
  private defaultSuppliers = [
    'Essentiels du Sahara (Tozeur, Tunisia)',
    'Ingrédients de Carthage (Tunis, Tunisia)',
    'Extraits Tunisiens (Tunis, Tunisia)'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadForecasts();
  }

  get successfulForecasts(): number {
    return this.forecasts.filter(f => f.status === 'success').length;
  }

  get errorForecasts(): number {
    return this.forecasts.filter(f => f.status === 'error').length;
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
        this.forecasts = results.map(result => ({
          ...result,
          last_updated: new Date().toISOString()
        }));
        this.filteredForecasts = [...this.forecasts];
        this.lastUpdatedDate = new Date();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load forecasts:', err);
        this.errorMessage = 'Failed to load supplier forecasts. Please try again later.';
        if (err.error?.message) {
          this.errorMessage += ` (${err.error.message})`;
        }
        this.loading = false;
      }
    });
  }

  applyFilter() {
    let results = [...this.forecasts];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      results = results.filter(forecast => forecast.status === this.statusFilter);
    }
    
    this.filteredForecasts = results;
  }

  refreshForecast(supplier: string) {
    this.loading = true;
    
    this.http.get<ForecastResult>(`http://localhost:5000/ml/forecast?supplier=${encodeURIComponent(supplier)}`).subscribe({
      next: (result) => {
        // Update the specific forecast in our array
        const index = this.forecasts.findIndex(f => f.supplier === supplier);
        if (index >= 0) {
          this.forecasts[index] = {
            ...result,
            last_updated: new Date().toISOString()
          };
          this.filteredForecasts = [...this.forecasts];
          this.lastUpdatedDate = new Date();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to refresh forecast:', err);
        this.errorMessage = `Failed to refresh forecast for ${supplier}. Please try again.`;
        this.loading = false;
      }
    });
  }

  getMinForecast(forecastData: ForecastItem[]): number {
    return Math.min(...forecastData.map(item => item.yhat));
  }

  getMaxForecast(forecastData: ForecastItem[]): number {
    return Math.max(...forecastData.map(item => item.yhat));
  }

  getAverageForecast(forecastData: ForecastItem[]): number {
    const sum = forecastData.reduce((acc, item) => acc + item.yhat, 0);
    return sum / forecastData.length;
  }
}