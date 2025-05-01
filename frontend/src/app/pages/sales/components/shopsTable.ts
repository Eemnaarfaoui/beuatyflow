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

@Component({
    selector: 'app-shops-table',
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
      [value]="shops"
      dataKey="shopid"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['city', 'country', 'shop_name']"
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
              Shop ID
              <p-columnFilter type="text" field="shopid" display="menu" placeholder="Search by id"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 10rem">
            <div class="flex justify-between items-center">
              Shop Name
              <p-columnFilter type="text" field="shopname" display="menu" placeholder="Search by name"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 16rem">
            <div class="flex justify-between items-center">
              Address
              <p-columnFilter type="text" field="address" display="menu" placeholder="Search by address"></p-columnFilter>
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
              Email
              <p-columnFilter type="text" field="email" display="menu" placeholder="Search by email"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 12rem">
            <div class="flex justify-between items-center">
              Contact
              <p-columnFilter type="text" field="contact" display="menu" placeholder="Search by contact"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 8rem">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-shop>
        <tr>
          <td>{{ shop.shopid }}</td>
          <td>{{ shop.shopname }}</td>
          <td>{{ shop.address }}</td>
          <td>{{ shop.city }}</td>
          <td>{{ shop.country }}</td>
          <td>{{ shop.email }}</td>
          <td>{{ shop.contact }}</td>
          <td class="flex gap-2">
            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="success" (onClick)="updateShop(shop)" />
            <app-delete [shopId]="shop.shopid" (confirmedDelete)="deleteShop($event)"></app-delete>
          </td>
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
export class ShopTable implements OnInit {
  shops: Shop[] = [];
  loading: boolean = true;

  @Output() editRequested = new EventEmitter<any>();

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.shopService.getAllShops().subscribe({
      next: (response) => {
        this.shops = response;
        console.log('Shops fetched successfully:', this.shops);
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

  updateShop(shop: any) {
    this.editRequested.emit(shop);
  }

  deleteShop(shopId: string) {
    this.shopService.deleteShop(shopId).subscribe({
      next: () => {
        console.log('Shop deleted successfully');
        this.loadShops();
      },
      error: (err) => {
        console.error('Failed to delete shop:', err);
      }
    });
  }
}
