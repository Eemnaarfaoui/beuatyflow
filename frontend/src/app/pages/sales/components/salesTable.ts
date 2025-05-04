import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { Shop } from '../models/shops';
import { ShopService } from '../services/shops.service';
import { DeleteComponent } from "./delete";
import { SalesService } from '../services/sales.service';
import { Sale } from '../models/sales-model';

@Component({
    selector: 'app-sales-table',
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
      [value]="sales"
      dataKey="shopid"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['category_name', 'shop_id', 'fulldate']"
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
        <th style="min-width: 15rem">
            <div class="flex justify-between items-center">
              Product Name
              <p-columnFilter type="text" field="product_name" display="menu" placeholder="Search by Name"></p-columnFilter>
            </div>
          </th>
        <th style="min-width: 15rem">
            <div class="flex justify-between items-center">
              Category
              <p-columnFilter type="text" field="category_name" display="menu" placeholder="Search by Category"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Date
              <p-columnFilter type="date" field="date" display="menu" placeholder="mm/dd/yyyy"></p-columnFilter>
              </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Address
              <p-columnFilter type="text" field="id_geo" display="menu" placeholder="Search by address"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Quantity
              <p-columnFilter type="text" field="quantity" display="menu"></p-columnFilter>
            </div>
          </th>
         
            <th style="min-width: 10rem">
                <div class="flex justify-between items-center">
                Shop ID
                <p-columnFilter type="text" field="shop_id" display="menu" placeholder="Search by shop id"></p-columnFilter>
                </div>
          
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-sale>
        <tr>
        <td>{{ sale.product_name}}</td>
          <td>{{ sale.category_name}}</td>
          <td>{{ sale.fulldate }}</td>
          <td>{{ sale.id_geo }}</td>
        <td>{{ sale.quantity }}</td>
        <td>{{ sale.shop_id }}</td>
  
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="4">No shop found.</td>
        </tr>
      </ng-template>

      <ng-template #loadingbody>
        <tr>
          <td colspan="4">Loading shops. Please wait...</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class SalesTable implements OnInit {
    sales: Sale[] = [];
    loading: boolean = true;

    @Output() editRequested = new EventEmitter<any>();

    constructor(private saleService: SalesService) { }

    ngOnInit() {
        this.loadSales();
    }

    loadSales() {
        this.loading = true;
        this.saleService.getSales().subscribe({
            next: (response: Sale[]) => {
                this.sales = response.map(sale => ({
                    ...sale,
                    fulldate: new Date(sale.fulldate).toLocaleDateString('en-US')
                }));
                console.log('Sales fetched successfully:', this.sales);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to fetch sales:', err);
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
