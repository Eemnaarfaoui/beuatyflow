import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { CountUpModule } from 'ngx-countup';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, HttpClientModule, CountUpModule],
  template: `
    <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Filter Section -->
      <div class="bg-white shadow-md px-3 pt-3 pb-1 rounded-lg w-64 h-auto">
        <h3 class="text-lg font-semibold mb-3">Filter by Budget</h3>
        <div *ngFor="let option of budgetOptions">
          <label class="flex items-center space-x-2">
            <input type="checkbox" [value]="option" (change)="onBudgetChange($event)" />
            <span>{{ option }}</span>
          </label>
        </div>
      </div>

      <!-- Chart -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Preferences Distribution</h2>
        <img 
          [src]="chartUrl" 
          alt="Preferences Chart" 
          class="shadow-lg rounded-lg border border-gray-200 w-full max-w-3xl mb-8 bg-white p-2"
        />
      </div>

      <!-- Statistics Table -->
      <div class="bg-white shadow-lg rounded-lg p-6 col-span-2">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">📊 Summary Statistics</h3>
        <table class="table-auto w-full border text-sm text-left text-gray-700">
          <thead class="bg-gray-100 text-gray-600 uppercase">
            <tr>
              <th class="px-4 py-2">Metric</th>
              <th class="px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody *ngIf="statistics">
            <tr class="border-b">
              <td class="px-4 py-2 font-medium">Total Clients</td>
              <td class="px-4 py-2 text-blue-600 font-semibold">
                {{ statistics.total_clients }}
              </td>
            </tr>

            <tr class="border-t">
              <td colspan="2" class="px-4 py-2 font-semibold text-purple-700">Clients by Budget</td>
            </tr>
            <tr *ngFor="let budget of statistics.by_budget">
              <td class="px-4 py-2 pl-8">{{ budget.budget }}</td>
              <td class="px-4 py-2">{{ (budget.count / statistics.total_clients * 100) | number: '1.0-1' }}%</td>
            </tr>

            <tr class="border-t">
              <td colspan="2" class="px-4 py-2 font-semibold text-pink-700">Clients by Cosmetic Preference</td>
            </tr>
            <tr *ngFor="let pref of statistics.by_preference_cos">
              <td class="px-4 py-2 pl-8">{{ pref.preference_cos }}</td>
              <td class="px-4 py-2">{{ (pref.count / statistics.total_clients * 100) | number: '1.0-1' }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PreferencesComponent implements OnInit {
  chartUrl = 'http://localhost:5000/api/preferences/visual/';
  statistics: any;
  selectedBudgets: string[] = [];
  budgetOptions = ['Moins de 50 TND', '50 - 100 TND', '100 - 200 TND', 'Plus de 200 TND'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStats();
    this.updateChartUrl();
  }

  fetchStats() {
    let params = new HttpParams();
    this.selectedBudgets.forEach(b => params = params.append('budget', b));
    this.http.get('http://localhost:5000/api/preferences/stats', { params }).subscribe({
      next: (data) => this.statistics = data,
      error: (err) => console.error('Failed to load statistics:', err)
    });
  }

  updateChartUrl() {
    const query = this.selectedBudgets.map(b => `budget=${encodeURIComponent(b)}`).join('&');
    this.chartUrl = `http://localhost:5000/api/preferences/visual/${query ? '?' + query : ''}`;
  }

  onBudgetChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedBudgets.push(value);
    } else {
      this.selectedBudgets = this.selectedBudgets.filter(b => b !== value);
    }
    this.fetchStats();
    this.updateChartUrl();
  }
}
