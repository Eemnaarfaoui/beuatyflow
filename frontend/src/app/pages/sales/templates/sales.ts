import { Component } from '@angular/core';
import { SalesTable } from "../components/salesTable";
import { SalesPredictionComponent } from "../components/sales-prediction";
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sales-data',
    imports: [SalesTable, SalesPredictionComponent,ButtonModule,CommonModule],
    template: `
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">
        {{ showPredict ?  'Prediction charts'  : 'Sales Overview' }}
      </div>

      <button
        pButton
        label="{{ showPredict ? 'Back to overview' : 'Predict' }}"
        icon="{{ showPredict ? 'pi pi-arrow-left' : 'pi pi-chart-line' }}"
        (click)="toggleView()"
        class="p-button-success">
      </button>
    </div> 

    <ng-container *ngIf="!showPredict">
    <app-sales-table></app-sales-table>
      </ng-container>

    <ng-container *ngIf="showPredict">
    <app-sales-prediction></app-sales-prediction>
      
    </ng-container>
  </div>

  `,
})
export class SalesComponent {
    showPredict = false;
    editingShop: any = null; 
  
    toggleView() {
      this.showPredict = !this.showPredict;
      this.editingShop = null; // reset editing when toggling manually
    }
  
    onEditShop(shop: any) {
      this.editingShop = shop;
      
      this.showPredict = true;
    }
  
    onDone() {
      this.showPredict = false;
      this.editingShop = null;
    }
}
