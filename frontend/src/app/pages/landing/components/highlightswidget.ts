import { Component } from '@angular/core';
@Component({
  selector: 'highlights-widget',
  template: `
    <div id="highlights" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
        <div class="text-center">
            <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Powerful Features for Your Supply Chain</div>
            <span class="text-muted-color text-2xl">Leverage Power BI and Machine Learning for smarter decision-making and efficient operations.</span>
        </div>

        <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20">
            <div class="flex justify-center col-span-12 lg:col-span-6  p-0 order-1 lg:order-none" style="border-radius: 8px">
                <img src="/assets/Dashboard_Sales.png" class="w-11/12" alt="Power BI Integration" />
            </div>

            <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
                <div class="flex items-center justify-center bg-purple-200 self-center lg:self-end" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                    <i class="pi pi-fw pi-chart-bar !text-4xl text-purple-700"></i>
                </div>
                <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Power BI Integration</div>
                <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px">
                    Integrate real-time data from your supply chain into Power BI to monitor sales trends, track inventory, and analyze market behavior with dynamic dashboards.
                </span>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-4 mb-10 pt-2 md:pt-20">
            <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
                <div class="flex items-center justify-center bg-yellow-200 self-center lg:self-start" style="width: 4.2rem; height: 4.2rem; border-radius: 10px">
                    <i class="pi pi-fw pi-chart-line !text-3xl text-yellow-700"></i>
                </div>
                <div class="leading-none text-surface-900 dark:text-surface-0 text-3xl font-normal">Sales Prediction Model</div>
                <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px">
                    Forecast future sales and optimize inventory management using machine learning models that predict demand based on historical data.
                </span>
            </div>

            <div class="flex justify-end order-1 sm:order-2 col-span-12 lg:col-span-6 p-0" style="border-radius: 8px">
                <img src="/assets/screenshot.png" class="w-11/12" alt="Sales Prediction" />
            </div>
        </div>

    
  `
})
export class HighlightsWidget {

    
}
