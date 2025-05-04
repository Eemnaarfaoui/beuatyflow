import { Component } from '@angular/core';
import { ShopTable } from "../components/shopsTable";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { UsersTable } from '../../user_management/components/usersTable';
import { ShopsFormComponent } from "../components/shopsForm";

@Component({
  selector: 'app-sales-shops',
  imports: [ShopTable,
    ButtonModule,
    CommonModule, 
    ShopsFormComponent],
  template: `
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">
        {{ showForm ? (editingShop ? 'Edit Shop' : 'Add New Shop') : 'Shop Management' }}
      </div>

      <button
        pButton
        label="{{ showForm ? 'Shops List' : 'Add New Shop' }}"
        icon="{{ showForm ? 'pi pi-users' : 'pi pi-plus' }}"
        (click)="toggleView()"
        class="p-button-success">
      </button>
    </div> 

    <ng-container *ngIf="!showForm">
    <app-shops-table (editRequested)="onEditShop($event)"></app-shops-table>
      </ng-container>

    <ng-container *ngIf="showForm">
      <app-shop-form [shop]="editingShop" (done)="onDone()"></app-shop-form>
      
    </ng-container>
  </div> `,
})
export class ShopsComponent {
  showForm = false;
  editingShop: any = null; 

  toggleView() {
    this.showForm = !this.showForm;
    this.editingShop = null; // reset editing when toggling manually
  }

  onEditShop(shop: any) {
    this.editingShop = shop;
    
    this.showForm = true;
  }

  onDone() {
    this.showForm = false;
    this.editingShop = null;
  }
}
