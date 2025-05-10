import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { inventory  } from '../models/inventory'; 
import { DeleteComponent } from "./delete"; 

import { WarehouseService } from '../services/warehouses.service';


@Component({
    selector: 'app-inventory-table',
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    RippleModule,
    ButtonModule,
  
],
  template: `
    <p-table
      #dt
      [value]="inventory"
      dataKey="Warehouse_Name"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['Warehouse_Name', 'Product_ID', 'Location']"
      responsiveLayout="scroll"
    >
      <ng-template #caption>
        <div class="flex justify-between items-center flex-column sm:flex-row">
          <button pButton label="Clear Filters" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
          <div class="ml-auto">
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Warehouse Name
              <p-columnFilter type="text" field="Warehouse_name" display="menu" placeholder="Search by name"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 12rem">
            <div class="flex justify-between items-center">
              Location
              <p-columnFilter type="text" field="location" display="menu" placeholder="Search by location"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Product ID
              <p-columnFilter type="text" field="product_id" display="menu" placeholder="Search by product ID"></p-columnFilter>
            </div>
          </th>
         
         
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Quantity
              <p-columnFilter type="text" field="Quantity" display="menu" placeholder="Search by quantity"></p-columnFilter>
            </div>
          </th>
         
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-inventory>
        <tr>
            <td>{{ inventory.Warehouse_Name }}</td>
            <td>{{ inventory.Location }}</td>
            <td>{{ inventory.Product_ID }}</td>
            <td>{{ inventory.Quantity }}</td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="8">No inventory found.</td>
        </tr>
      </ng-template>

      <ng-template #loadingbody>
        <tr>
          <td colspan="8">Loading inventory. Please wait...</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class InventoryTable implements OnInit {
  inventory: inventory[] = [];
  loading: boolean = true;

  @Output() editRequested = new EventEmitter<any>();

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.loading = true;
    this.warehouseService.getInventory().subscribe({
      next: (response) => {
        this.inventory = response;
        console.log('Shops fetched successfully:', this.inventory);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch inventory:', err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  
  }

