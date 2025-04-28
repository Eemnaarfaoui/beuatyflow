import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Recommendation {
  Product: string;
  Supplier: string;
  Score: number;
  Avg_Price: number;
  Quantity: number;
}

interface RecommendationReport {
  plot_image?: string;
  recommendations: Recommendation[];
  total_products: number;
  analyzed_products: number;
  status: string;
  error?: string;
}

@Component({
  selector: 'app-ex-env-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Supplier Recommendations</h1>
    
    <div *ngIf="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-2">Loading recommendations...</p>
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
    
    <div *ngIf="report" class="space-y-8">
      <div class="stats bg-blue-50 p-4 rounded-lg">
        <p class="text-blue-800">
          Products analyzed: {{ report.analyzed_products }}/{{ report.total_products }}
          <span class="text-sm text-blue-600">(minimum 3 suppliers required)</span>
        </p>
      </div>
      
      <div *ngIf="report.plot_image" class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Recommendation Visualization</h2>
        <img [src]="'data:image/png;base64,' + report.plot_image" 
             alt="Supplier recommendation visualization" 
             class="w-full h-auto">
        <p class="text-sm text-gray-500 mt-2">
          Note: Scores range from 0 (not recommended) to 1 (highly recommended)
        </p>
      </div>
      
      <div *ngIf="report.recommendations.length > 0" class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Best Supplier by Product</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price (TND)</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let rec of report.recommendations" 
                  [class.bg-blue-50]="rec === report.recommendations[0]">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ rec.Product }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ rec.Supplier }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-100 text-green-800': rec.Score >= 0.7,
                          'bg-yellow-100 text-yellow-800': rec.Score >= 0.4 && rec.Score < 0.7,
                          'bg-red-100 text-red-800': rec.Score < 0.4
                        }">
                    {{ rec.Score | number:'1.2-2' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ rec.Avg_Price | number:'1.2-2' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ rec.Quantity | number:'1.0-0' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div *ngIf="report.recommendations.length === 0 && !loading" class="bg-yellow-50 p-4 rounded-lg">
        <p class="text-yellow-800">No recommendations available. Not enough data to generate recommendations.</p>
      </div>
    </div>
  </div>
  `,
  styles: []
})
export class ExEnvSuppliersComponent implements OnInit {
  loading = true;
  errorMessage = '';
  report: RecommendationReport | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.loading = true;
    this.errorMessage = '';
    
    this.http.get<RecommendationReport>('http://localhost:5000/ml/recommendations').subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recommendations:', err);
        this.errorMessage = 'Failed to load supplier recommendations. Please try again later.';
        if (err.error?.message) {
          this.errorMessage += ` (${err.error.message})`;
        }
        this.loading = false;
      }
    });
  }
}