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
import { Order } from '../models/orders-model';
import { OrdersService } from '../services/orders.service';

@Component({
    selector: 'app-orders-table',
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
      [value]="orders"
      dataKey="shopid"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['shop_country', 'shop_city', 'ShippingAddress', 'ProductName']"
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
              Order ID
              <p-columnFilter type="text" field="OrderID" display="menu" placeholder="Search by ID"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 12rem">
            <div class="flex justify-between items-center">
              Order Date
              <p-columnFilter type="text" field="OrderDate" display="menu" placeholder="Search by date"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Shop ID
              <p-columnFilter type="text" field="ShopID" display="menu" placeholder="Search by shop ID"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Shipping Address
              <p-columnFilter type="text" field="ShippingAddress" display="menu" placeholder="Search by address"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Product Name
              <p-columnFilter type="text" field="ProductName" display="menu" placeholder="Search by product"></p-columnFilter>
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

      <ng-template pTemplate="body" let-order>
        <tr>
          <td>{{ order.OrderID }}</td>
          <td>{{ order.OrderDate | date }}</td>
          <td>{{ order.ShopID }}</td>
          <td>{{ order.ShippingAddress }}</td>
          <td>{{ order.ProductName }}</td>
          <td>{{ order.Quantity }}</td>
 

        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="8">No orders found.</td>
        </tr>
      </ng-template>

      <ng-template #loadingbody>
        <tr>
          <td colspan="8">Loading orders. Please wait...</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class OrderTable implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;

  @Output() editRequested = new EventEmitter<any>();

  constructor(private orderService: OrdersService) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response;
        console.log('Shops fetched successfully:', this.orders);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch shops:', err);
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

