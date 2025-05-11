import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbootComponent } from '../../chatboot/component/chatboot/chatboot.component';

@Component({
  selector: 'features-widget',
  standalone: true,
  imports: [CommonModule, ChatbootComponent],
  template: `
  <div id="features" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
    <div class="grid grid-cols-12 gap-4 justify-center">
      <div class="col-span-12 text-center mt-20 mb-6">
        <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Powerful Features for Your Supply Chain</div>
        <span class="text-muted-color text-2xl">Enhance operational efficiency, optimize decision-making, and leverage data insights</span>
      </div>
      <app-chatboot></app-chatboot>
      <!-- Easy to Use -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-yellow-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-users !text-2xl text-yellow-700"></i>
            </div>
            <h5 class="mb-2 text-surface-900 dark:text-surface-0">Easy to Use</h5>
            <span class="text-surface-600 dark:text-surface-200">User-friendly interface for effortless navigation and supply chain management.</span>
          </div>
        </div>
      </div>

      <!-- Filters and Real-time Insights -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-cyan-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-filter !text-2xl text-cyan-700"></i>
            </div>
            <h5 class="mb-2 text-surface-900 dark:text-surface-0">Advanced Filters</h5>
            <span class="text-surface-600 dark:text-surface-200">Apply custom filters for quick analysis and actionable insights in your supply chain.</span>
          </div>
        </div>
      </div>

      <!-- Dark Mode -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-indigo-200" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-moon !text-2xl text-indigo-700"></i>
            </div>
            <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold">Dark Mode</div>
            <span class="text-surface-600 dark:text-surface-200">Convenient dark mode for reduced eye strain during long hours of analysis.</span>
          </div>
        </div>
      </div>

      <!-- Power BI Integration -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-yellow-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-microsoft !text-2xl text-yellow-700"></i>
            </div>
            <h5 class="mb-2 text-surface-900 dark:text-surface-0">Power BI Integration</h5>
            <span class="text-surface-600 dark:text-surface-200">Monitor real-time sales, analyze market trends, and track inventory with Power BI dashboards, secured based on user roles.</span>
          </div>
        </div>
      </div>

      <!-- Sales Prediction Model -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-cyan-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-chart-line !text-2xl text-cyan-700"></i>
            </div>
            <h5 class="mb-2 text-surface-900 dark:text-surface-0">Sales Prediction Model</h5>
            <span class="text-surface-600 dark:text-surface-200">Machine learning models for forecasting future sales, ensuring optimized inventory management, based on access roles for secure data analysis.</span>
          </div>
        </div>
      </div>

      <!-- Anomaly Detection -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(145, 210, 204, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-slate-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-chart-bar !text-2xl text-slate-700"></i>
            </div>
            <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold">Anomaly Detection</div>
            <span class="text-surface-600 dark:text-surface-200">Detect products with abnormal sales trends compared to historical performance using machine learning models.</span>
          </div>
        </div>
      </div>

      <!-- Product Recommendations -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(160, 210, 250, 0.2)), linear-gradient(180deg, rgba(187, 199, 205, 0.2), rgba(145, 210, 204, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-teal-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-barcode !text-2xl text-teal-700"></i>
            </div>
            <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold">Product Recommendations</div>
            <span class="text-surface-600 dark:text-surface-200">Recommend products based on price, availability, and quantity for suppliers, ensuring product availability and better product pairing.</span>
          </div>
        </div>
      </div>

      <!-- Warehouse Clustering -->
      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
        <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))">
          <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
            <div class="flex items-center justify-center bg-teal-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
              <i class="pi pi-fw pi-chart-scatter !text-2xl text-teal-700"></i>
            </div>
            <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold">Warehouse Clustering</div>
            <span class="text-surface-600 dark:text-surface-200">Cluster warehouses based on demand, capacity, and product diversification for efficient logistics management.</span>
          </div>
        </div>
      </div>

      <!-- Role Based Security -->

      <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))">
    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full" style="border-radius: 8px">
      <div class="flex items-center justify-center bg-teal-200 mb-4" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
        <i class="pi pi-fw pi-lock !text-2xl text-teal-700"></i>
      </div>
      <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold">Role-Based Security</div>
      <span class="text-surface-600 dark:text-surface-200">Ensure secure access to data and features based on user roles, protecting sensitive information and controlling visibility in the system.</span>
    </div>
  </div>
</div>


    </div>
  </div>
  `
  
})
export class FeaturesWidget {}