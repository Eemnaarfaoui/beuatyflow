import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { warehouse } from '../models/warehouses';
import { WarehouseService } from '../services/warehouses.service';
import { DeleteComponent } from "./delete";

// Imports pour l'export Excel
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-warehouses-table',
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
    DeleteComponent
  ],
  template: `
    <p-table
      #dt
      [value]="warehouse"
      dataKey="warehouseid"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['city', 'country', 'warehousename']"
      responsiveLayout="scroll"
    >
      <ng-template #caption>
        <div class="flex justify-between items-center flex-column sm:flex-row">
          <div class="flex gap-2 mb-2 sm:mb-0">
            <button pButton label="Clear Filters" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <button pButton label="Export Excel" class="p-button-success" icon="pi pi-file-excel" (click)="exportExcel()"></button>
          </div>
          <div class="ml-auto">
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr>
          <th style="min-width: 15rem">
            <div class="flex justify-between items-center">
              Warehouse ID
              <p-columnFilter type="number" field="warehouseid" display="menu" placeholder="Search by id"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Warehouse Name
              <p-columnFilter type="text" field="warehousename" display="menu" placeholder="Search by name"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Location
              <p-columnFilter type="text" field="location" display="menu" placeholder="Search by location"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              City
              <p-columnFilter type="text" field="city" display="menu" placeholder="Search by city"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Country
              <p-columnFilter type="text" field="country" display="menu" placeholder="Search by country"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Capacity
              <p-columnFilter type="number" field="capacity" display="menu" placeholder="Search by capacity"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 8rem">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-warehouse>
        <tr>
          <td>{{ warehouse.warehouseid }}</td>
          <td>{{ warehouse.warehousename }}</td>
          <td>{{ warehouse.location }}</td>
          <td>{{ warehouse.city }}</td>
          <td>{{ warehouse.country }}</td>
          <td>{{ warehouse.capacity }}</td>
          <td class="flex gap-2">
            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="success" (onClick)="updateWarehouse(warehouse)" />
            <app-delete [warehouseId]="warehouse.warehouseid" (confirmedDelete)="deleteWarehouse(+$event)"></app-delete>
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="7">No warehouse found.</td>
        </tr>
      </ng-template>

      <ng-template #loadingbody>
        <tr>
          <td colspan="7">Loading warehouses. Please wait...</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class WarehouseTable implements OnInit {
  warehouse: warehouse[] = [];
  loading: boolean = true;

  @Output() editRequested = new EventEmitter<any>();

  constructor(private WarehouseService: WarehouseService) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading = true;
    this.WarehouseService.getAllWarehouses().subscribe({
      next: (response) => {
        this.warehouse = response;
        console.log('warehouse fetched successfully:', this.warehouse);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch warehouses:', err);
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

  updateWarehouse(warehouse: any) {
    this.editRequested.emit(warehouse);
  }

  deleteWarehouse(warehouseId: number) {
    this.WarehouseService.deleteWarehouse(warehouseId).subscribe({
      next: () => {
        console.log('warehouse deleted successfully');
        this.loadWarehouses();
      },
      error: (err) => {
        console.error('Failed to delete warehouse:', err);
      }
    });
  }

  exportExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.warehouse);
    const workbook = { Sheets: { 'Warehouses': worksheet }, SheetNames: ['Warehouses'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blobData: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blobData, 'Warehouses.xlsx');
  }
}
