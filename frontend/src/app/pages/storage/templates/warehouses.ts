import { Component } from '@angular/core';
declarations: [WarehouseTable, WarehouseFormComponent]
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { UsersTable } from '../../user_management/components/usersTable';
import { WarehouseFormComponent } from "../components/warehouseForm";
import { WarehouseTable } from '../components/warehousesTable';

@Component({
  selector: 'app-storage-warehouses',
  imports: [WarehouseTable,
    ButtonModule,
    CommonModule, 
    WarehouseFormComponent],
  template: `
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">
        {{ showForm ? (editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse') : 'Warehouse Management' }}
      </div>

      <button
        pButton
        label="{{ showForm ? 'Warehouses List' : 'Add New Warehouse' }}"
        icon="{{ showForm ? 'pi pi-users' : 'pi pi-plus' }}"
        (click)="toggleView()"
        class="p-button-success">
      </button>
    </div> 

    <ng-container *ngIf="!showForm">
    <app-warehouses-table (editRequested)="onEditWarehouse($event)"></app-warehouses-table>
      </ng-container>

    <ng-container *ngIf="showForm">
      <app-warehouse-form [warehouse]="editingWarehouse" (done)="onDone()"></app-warehouse-form>
      
    </ng-container>
  </div> `,
})
export class WarehousesComponent {
  showForm = false;
  editingWarehouse: any = null; 

  toggleView() {
    this.showForm = !this.showForm;
    this.editingWarehouse = null; // reset editing when toggling manually
  }

  onEditWarehouse(warehouse: any) {
    this.editingWarehouse = warehouse;
    
    this.showForm = true;
  }

  onDone() {
    this.showForm = false;
    this.editingWarehouse = null;
  }
}
