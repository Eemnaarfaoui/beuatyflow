import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';


import { ShopService } from '../services/shops.service';
import { ConfirmComponent } from './confirmation';
import { Shop } from '../models/shops';

@Component({
  selector: 'app-shop-form',
  standalone: true,
  imports: [
    MultiSelectModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    SelectModule,
    FluidModule,
    ConfirmComponent // <--- Import here too
  ],
  template: `
  <div class="md:w-1/2">
    <div class="card flex flex-col gap-4">

      <app-confirmation 
        [message]="confirmationMessage"
        (closed)="onConfirmationClosed()"
        #confirmationDialog
      ></app-confirmation>

      <div class="flex flex-col gap-2">
        <label for="shopid">Shop ID</label>
        <input pInputText id="shopid" type="text" [(ngModel)]="shopid" name="shopid" placeholder="Enter shopid name" />
        <small *ngIf="submitted && !shopid" class="text-red-500"> Shop ID is required</small>
      </div>


      <div class="flex flex-col gap-2">
        <label for="address">Address</label>
        <input pInputText id="address" type="text" [(ngModel)]="address" name="address" placeholder="Enter shop address" />
        <small *ngIf="submitted && !address" class="text-red-500">Address is required</small>

      </div>


      <div class="flex flex-col gap-2">
        <label for="city">City</label>
        <input pInputText id="city" type="text" [(ngModel)]="city" name="city" placeholder="Enter city name" />
        <small *ngIf="submitted && !city" class="text-red-500">City name is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="contact">Contact</label>
        <input pInputText id="contact" type="text" [(ngModel)]="contact" name="contact" placeholder="Enter shop contact" />
        <small *ngIf="submitted && !contact" class="text-red-500">Contact is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="country">Country</label>
        <input pInputText id="country" type="text" [(ngModel)]="country" name="country" placeholder="Enter country" />
        <small *ngIf="submitted && !country" class="text-red-500">Country is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="email">Email</label>
        <input pInputText id="email" type="text" [(ngModel)]="email" name="email" placeholder="Enter email" />
        <small *ngIf="submitted && !email" class="text-red-500">Email is required</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="shopname"> Shop Name</label>
        <input pInputText id="shopname" type="text" [(ngModel)]="shopname" name="shopname" placeholder="Enter shop name" />
        <small *ngIf="submitted && !shopname" class="text-red-500">Shop name is required</small>
      </div>
      <p-button label="Submit" (click)="submitShop()" [disabled]="loading" [fluid]="false"></p-button>
    </div>
  </div>
  `
})
export class ShopsFormComponent {
  @Input() shop: Shop = {} as Shop; // Initialize with an empty object to avoid undefined errors
  @Output() done = new EventEmitter<void>();

  @ViewChild('confirmationDialog') confirmationDialog!: ConfirmComponent;

  city: string = '';
  contact: string = '';
  country: string = '';
  email: string = '';
  shopname: string = '';
  shopid: string = '';
  address: string = '';

  confirmationMessage: string = '';
  loading = false;
  submitted = false;



  constructor(private shopService: ShopService) {}

  ngOnInit() {
    if (this.shop) {
      this.address = this.shop.address || '';
      this.shopid = this.shop.shopid || '';
      this.city = this.shop.city || '';
      this.contact = this.shop.contact || '';
      this.country = this.shop.country || '';
      this.email = this.shop.email || '';
      this.shopname = this.shop.shopname || '';
    }
  }

  submitShop() {
    this.submitted = true;

    if (!this.city || !this.contact || !this.country || !this.email || !this.shopname || !this.shopid || !this.address) {
      console.warn('Validation failed');
      return;
    }

    const payload = {
      
      shopid: this.shopid,
      email: this.email,
      address: this.address,
      city: this.city,
      contact: this.contact,
      country:this.country,
      shopname:this.shopname
    };

    this.loading = true;

    if (this.shop) {
      // Update
      this.shopService.updateShop(this.shop.shopid, payload).subscribe({
        next: (res) => {
          console.log('User updated successfully:', res);
          this.confirmationMessage = 'User updated successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to update shop:', err);
          alert('Failed to update shop.');
          this.loading = false;
        }
      });
    } else {
      // Create
      this.shopService.addShop(payload).subscribe({
        next: (res) => {
          console.log('Shop created successfully:', res);
          this.confirmationMessage = 'Shop created successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to create shop:', err);
          alert('Failed to create shop.');
          this.loading = false;
        }
      });
    }
  }

  onConfirmationClosed() {
    this.done.emit(); // tell Admin Panel to go back to the shop list
  }
}
