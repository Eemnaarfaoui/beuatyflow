import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  points?: any[];
}

@Component({
  selector: 'app-ex-env-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Supplier Recommendations Dashboard</h1>
        <p class="mt-2 text-gray-600">Visual analysis of supplier performance metrics</p>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-700 font-medium">Processing supplier data...</p>
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
            <h3 class="text-sm font-medium text-red-800">Data loading error</h3>
            <div class="mt-1 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="report" class="space-y-8">
        <!-- Stats Card -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100">
          <div class="flex items-center">
            <svg class="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p class="text-lg font-medium text-blue-800">
                Analyzed {{ report.analyzed_products }} of {{ report.total_products }} products
              </p>
              <p class="text-sm text-blue-600 mt-1">
                (Minimum 3 suppliers required for recommendation analysis)
              </p>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Supplier Filter
          </h2>
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div class="w-full sm:w-72">
              <select 
                id="supplier-select"
                [(ngModel)]="selectedSupplier" 
                (change)="onSupplierChange()"
                class="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Suppliers</option>
                <option *ngFor="let supplier of uniqueSuppliers" [value]="supplier">
                  {{ supplier }}
                </option>
              </select>
            </div>
            <div class="flex gap-3 mt-6 sm:mt-0">
              <button
                (click)="applyFilter()"
                class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Apply
              </button>
              <button
                (click)="resetFilter()"
                class="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-300 transition-colors flex items-center"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <!-- Visualization Card -->
        <div *ngIf="(selectedSupplier ? currentPlotImage : report.plot_image)" class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {{ selectedSupplier ? selectedSupplier + ' Performance' : 'Recommendation Overview' }}
            </h2>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Interactive
            </span>
          </div>
          
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <img [src]="'data:image/png;base64,' + (selectedSupplier ? currentPlotImage : report.plot_image)" 
                 alt="Supplier performance visualization" 
                 class="w-full h-auto">
          </div>
          
          <div class="mt-4 flex items-center text-sm text-gray-500">
            <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Scores range from 0 (not recommended) to 1 (highly recommended)
          </div>
        </div>
        
        <!-- Recommendations Table -->
        <div *ngIf="filteredRecommendations.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ selectedSupplier ? 'Product Recommendations' : 'Optimal Supplier Selection' }}
            </h2>
            
            <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <!-- Search Input -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  [(ngModel)]="searchTerm"
                  (input)="applyFilter()"
                  type="text" 
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="Search products...">
              </div>
              
              <!-- Sort Dropdown -->
              <div class="relative">
                <select 
                  [(ngModel)]="sortField"
                  (change)="applyFilter()"
                  class="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Sort by</option>
                  <option value="Score">Score</option>
                  <option value="Avg_Price">Price</option>
                  <option value="Quantity">Quantity</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              
              <!-- Sort Direction Toggle -->
              <button 
                (click)="toggleSortDirection()"
                class="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="sortDirection === 'asc' ? 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4' : 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12'" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button class="flex items-center" (click)="sortBy('Product')">
                      Product
                      <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button class="flex items-center" (click)="sortBy('Supplier')">
                      Supplier
                      <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button class="flex items-center" (click)="sortBy('Score')">
                      Score
                      <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button class="flex items-center" (click)="sortBy('Avg_Price')">
                      Avg Price
                      <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button class="flex items-center" (click)="sortBy('Quantity')">
                      Quantity
                      <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let rec of filteredRecommendations" 
                    [class.bg-blue-50]="!selectedSupplier && rec === report.recommendations[0]"
                    class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ rec.Product }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ rec.Supplier }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold leading-4"
                          [ngClass]="{
                            'bg-green-100 text-green-800': rec.Score >= 0.7,
                            'bg-yellow-100 text-yellow-800': rec.Score >= 0.4 && rec.Score < 0.7,
                            'bg-red-100 text-red-800': rec.Score < 0.4
                          }">
                      {{ rec.Score | number:'1.2-2' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ rec.Avg_Price | currency:'TND':'symbol':'1.2-2' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ rec.Quantity | number:'1.0-0' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="filteredRecommendations.length === 0 && !loading" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                {{ selectedSupplier ? 'No recommended products found for ' + selectedSupplier : 'Insufficient data to generate recommendations' }}
              </p>
            </div>
          </div>
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
  uniqueSuppliers: string[] = [];
  selectedSupplier: string = '';
  filteredRecommendations: Recommendation[] = [];
  currentPlotImage: string | null = null;
  
  // Filtering and sorting properties
  searchTerm: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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
        this.uniqueSuppliers = [...new Set(report.recommendations.map(r => r.Supplier))];
        this.filteredRecommendations = [...report.recommendations];
        this.currentPlotImage = null;
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

  onSupplierChange() {
    if (!this.selectedSupplier) {
      this.resetFilter();
    } else {
      this.applyFilter();
    }
  }

  applyFilter() {
    if (!this.report) return;
    
    let results = [...this.report.recommendations];
    
    // Apply supplier filter if selected
    if (this.selectedSupplier) {
      results = results.filter(rec => rec.Supplier === this.selectedSupplier);
    }
    
    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(rec => 
        rec.Product.toLowerCase().includes(term) || 
        rec.Supplier.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    if (this.sortField) {
      results.sort((a, b) => {
        const valA = a[this.sortField as keyof Recommendation];
        const valB = b[this.sortField as keyof Recommendation];
        
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    this.filteredRecommendations = results;
    
    // Generate plot if supplier is selected
    if (this.selectedSupplier) {
      this.generateSupplierScatterPlot();
    } else {
      this.currentPlotImage = null;
    }
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilter();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.toggleSortDirection();
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
      this.applyFilter();
    }
  }

  resetFilter(): void {
    this.selectedSupplier = '';
    this.searchTerm = '';
    this.sortField = '';
    this.sortDirection = 'asc';
    this.filteredRecommendations = this.report ? [...this.report.recommendations] : [];
    this.currentPlotImage = null;
  }

  generateSupplierScatterPlot(): void {
    // Validate prerequisites
    if (!this.report || !this.selectedSupplier) {
      this.currentPlotImage = null;
      return;
    }

    // Canvas configuration
    const displayWidth = 800;
    const displayHeight = 500;
    const scale = 2; // For HD rendering
    const margin = { top: 70, right: 180, bottom: 70, left: 70 };
    const plotWidth = displayWidth - margin.left - margin.right;
    const plotHeight = displayHeight - margin.top - margin.bottom;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = displayWidth * scale;
    canvas.height = displayHeight * scale;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.currentPlotImage = null;
      return;
    }

    // Configure context
    ctx.scale(scale, scale);
    ctx.textBaseline = 'middle';

    // Draw background
    this.drawBackground(ctx, displayWidth, displayHeight);

    // Add title
    this.drawTitle(ctx, `Supplier Performance: ${this.selectedSupplier}`, displayWidth);

    // Extract data
    const { prices, quantities } = this.extractData();
    const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
    const quantityRange = { min: Math.min(...quantities), max: Math.max(...quantities) };

    // Draw grid and axes
    this.drawGrid(ctx, margin, plotWidth, plotHeight, priceRange, quantityRange);
    this.drawAxes(ctx, margin, plotWidth, plotHeight, displayWidth, displayHeight);

    // Plot data points
    this.drawDataPoints(ctx, margin, plotWidth, plotHeight, priceRange, quantityRange);

    // Add legend
    this.drawLegend(ctx, displayWidth, margin.right);

    // Export as base64
    this.currentPlotImage = canvas.toDataURL('image/png').split(',')[1];
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle gradient for modern look
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private drawTitle(ctx: CanvasRenderingContext2D, title: string, width: number): void {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 40);
  }

  private extractData(): { prices: number[]; quantities: number[] } {
    return {
      prices: this.filteredRecommendations.map(r => r.Avg_Price),
      quantities: this.filteredRecommendations.map(r => r.Quantity)
    };
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    plotWidth: number,
    plotHeight: number,
    priceRange: { min: number; max: number },
    quantityRange: { min: number; max: number }
  ): void {
    const steps = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Vertical grid (X axis)
    for (let i = 0; i <= steps; i++) {
      const x = margin.left + (plotWidth / steps) * i;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();

      const label = priceRange.min + ((priceRange.max - priceRange.min) / steps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label.toFixed(2), x, margin.top + plotHeight + 20);
    }

    // Horizontal grid (Y axis)
    for (let i = 0; i <= steps; i++) {
      const y = margin.top + (plotHeight / steps) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      const label = quantityRange.max - ((quantityRange.max - quantityRange.min) / steps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label.toFixed(0), margin.left - 10, y);
    }
  }

  private drawAxes(
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    plotWidth: number,
    plotHeight: number,
    displayWidth: number,
    displayHeight: number
  ): void {
    // Main axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#334155';
    ctx.font = '14px "Segoe UI", sans-serif';
    
    // X axis label
    ctx.textAlign = 'center';
    ctx.fillText('Average Price (TND)', displayWidth / 2, displayHeight - 25);

    // Y axis label
    ctx.save();
    ctx.translate(25, displayHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Total Quantity', 0, 0);
    ctx.restore();
  }

  private drawDataPoints(
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    plotWidth: number,
    plotHeight: number,
    priceRange: { min: number; max: number },
    quantityRange: { min: number; max: number }
  ): void {
    this.filteredRecommendations.forEach(rec => {
      const x = margin.left + ((rec.Avg_Price - priceRange.min) / (priceRange.max - priceRange.min || 1)) * plotWidth;
      const y = margin.top + plotHeight - ((rec.Quantity - quantityRange.min) / (quantityRange.max - quantityRange.min || 1)) * plotHeight;

      // Draw data point
      const pointColor = this.getScoreColor(rec.Score);
      
      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 5, x, y, 10);
      gradient.addColorStop(0, `${pointColor}80`);
      gradient.addColorStop(1, `${pointColor}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Main point
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = pointColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Product label
      ctx.fillStyle = '#334155';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      const productName = rec.Product.length > 14 ? `${rec.Product.substring(0, 12)}...` : rec.Product;
      ctx.fillText(productName, x + 12, y);
    });
  }

  private drawLegend(ctx: CanvasRenderingContext2D, displayWidth: number, rightMargin: number): void {
    const legendX = displayWidth - rightMargin + 30;
    const legendY = 70;
    const spacing = 28;
    
    const legendItems = [
      { label: 'High Score (≥ 0.7)', color: '#4CAF50' },
      { label: 'Medium Score (0.4–0.7)', color: '#FFC107' },
      { label: 'Low Score (< 0.4)', color: '#F44336' }
    ];

    // Legend background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - 20, legendY - 20, 160, legendItems.length * spacing + 20, 8);
    ctx.fill();
    ctx.stroke();

    // Legend items
    legendItems.forEach((item, i) => {
      // Colored point
      ctx.beginPath();
      ctx.arc(legendX, legendY + spacing * i, 6, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.fillStyle = '#334155';
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 15, legendY + spacing * i);
    });
  }

  private getScoreColor(score: number): string {
    if (score >= 0.7) return '#4CAF50';  // Green
    if (score >= 0.4) return '#FFC107';  // Yellow
    return '#F44336';                    // Red
  }
}