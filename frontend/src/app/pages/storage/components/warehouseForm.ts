import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';


import { WarehouseService } from '../services/warehouses.service';
import { ConfirmComponent } from './confirmation';
import { warehouse } from '../models/warehouses';

@Component({
  selector: 'app-warehouse-form',
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
        <label for="warehouseid">Wrehouse ID</label>
        <input pInputText id="warehouseid" type="number" [(ngModel)]="warehouseid" name="warehouseid" placeholder="Enter warehouseid name" />
        <small *ngIf="submitted && !warehouseid" class="text-red-500"> Warehouse ID is required</small>
      </div>


      <div class="flex flex-col gap-2">
        <label for="location">Location</label>
        <input pInputText id="location" type="text" [(ngModel)]="location" name="location" placeholder="Enter warehouse location" />
        <small *ngIf="submitted && !location" class="text-red-500">Location is required</small>

      </div>


      <div class="flex flex-col gap-2">
        <label for="city">City</label>
        <input pInputText id="city" type="text" [(ngModel)]="city" name="city" placeholder="Enter city name" />
        <small *ngIf="submitted && !city" class="text-red-500">City name is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="capacity">Capacity</label>
        <input pInputText id="capacity" type="number" [(ngModel)]="capacity" name="capacity" placeholder="Enter warehouse capacity" />
        <small *ngIf="submitted && !capacity" class="text-red-500">Capacity is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="country">Country</label>
        <input pInputText id="country" type="text" [(ngModel)]="country" name="country" placeholder="Enter country" />
        <small *ngIf="submitted && !country" class="text-red-500">Country is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="warehousename"> Warehouse Name</label>
        <input pInputText id="warehousename" type="text" [(ngModel)]="warehousename" name="warehousename" placeholder="Enter warehouse name" />
        <small *ngIf="submitted && !warehousename" class="text-red-500">Warehouse name is required</small>
      </div>
      <p-button label="Submit" (click)="submitWarehouse()" [disabled]="loading" [fluid]="false"></p-button>
    </div>
  </div>
  `
})
export class WarehouseFormComponent {
  @Input() warehouse: warehouse = {} as warehouse; // Initialize with an empty object to avoid undefined errors
  @Output() done = new EventEmitter<void>();

  @ViewChild('confirmationDialog') confirmationDialog!: ConfirmComponent;

  city: string = '';
  country: string = '';
  capacity: Number = 0;
  warehousename: string = '';
  warehouseid: number = 0;
  location: string = '';

  confirmationMessage: string = '';
  loading = false;
  submitted = false;



  constructor(private warehouseService: WarehouseService) {}

  ngOnInit() {
    if (this.warehouse) {
      this.location = this.warehouse.location || '';
      this.warehouseid = this.warehouse.warehouseid || 0;
      this.city = this.warehouse.city || '';
      this.capacity = this.warehouse.capacity || 0;
      this.country = this.warehouse.country || '';
      this.warehousename = this.warehouse.warehousename|| '';
    }
  }

  submitWarehouse() {
    this.submitted = true;

    if (!this.city || !this.location || !this.country  || !this.warehousename || !this.warehouseid|| !this.capacity) {
      console.warn('Validation failed');
      return;
    }

    const payload = {
      
      warehouseid: this.warehouseid,
      location: this.location,
      city: this.city,
      capacity:this.capacity,
      country:this.country,
      warehousename:this.warehousename
    };

    this.loading = true;

    if (this.warehouse) {
      // Update
      this.warehouseService.updateWarehouse(this.warehouse.warehouseid, payload).subscribe({
        next: (res) => {
          console.log('User updated successfully:', res);
          this.confirmationMessage = 'User updated successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to update warehouse:', err);
          alert('Failed to update warehouse.');
          this.loading = false;
        }
      });
    } else {
      // Create
      this.warehouseService.addWarehouse(payload).subscribe({
        next: (res) => {
          console.log('Warehouse created successfully:', res);
          this.confirmationMessage = 'Warehouse created successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to create warehouse:', err);
          alert('Failed to create warehouse.');
          this.loading = false;
        }
      });
    }
  }

  onConfirmationClosed() {
    this.done.emit(); // tell Admin Panel to go back to the warehouse list
  }
}
