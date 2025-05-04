import { Component, OnInit } from '@angular/core';
import { SalesService } from '../services/sales.service';
import { LayoutService } from '../../../layout/service/layout.service';
import { processSalesData } from '../helpers/chart-helper';  // Import the helper function
import { ChartModule } from 'primeng/chart';
import { debounceTime } from 'rxjs';
import { TabsModule } from 'primeng/tabs';

@Component({
    selector: 'app-sales-prediction',
    standalone: true,
    imports: [ChartModule, TabsModule],
    template: `
     <p-tabs value="0">
        <p-tablist>
            <p-tab value="0">Quantity Sold by Category</p-tab>
            <p-tab value="1">Sales Breakdown by Region</p-tab>
        </p-tablist>
        <p-tabpanels>
            <p-tabpanel value="0">
                <div class="card">
                    <p-chart type="line" [data]="lineData" [options]="lineOptions"></p-chart>
                </div>
            </p-tabpanel>
            <p-tabpanel value="1">
                <div class="card ">
                    <p-chart type="bar" [data]="barData" [options]="barOptions"></p-chart>
                </div>
        </p-tabpanel>
       
        </p-tabpanels>
    </p-tabs>
      
  `,

})
export class SalesPredictionComponent implements OnInit {

    lineData: any;
    lineOptions: any;
    barData: any;
    barOptions: any;

    constructor(private saleService: SalesService, private layoutService: LayoutService) {
        this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.fetchChartData();
        });
    }

    ngOnInit() {
        this.fetchChartData();
    }

    fetchChartData() {
        this.saleService.predictSales().subscribe({
            next: (data) => {
                const { lineData, lineOptions, barData, barOptions } = processSalesData(data); // Process the data using the helper function
                this.lineData = lineData;
                this.lineOptions = lineOptions;
                this.barData = barData;
                this.barOptions = barOptions;
            },
            error: (error) => {
                console.error('Error fetching sales data:', error);
            }
        });
    }
}
