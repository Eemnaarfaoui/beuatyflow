import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // Pagination module
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-warehouse-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgxPaginationModule],
  template: `
    <div class="card">
      <div class="font-semibold text-xl mb-4">Warehouse Management</div>

      <!-- Filters -->
      <div class="mb-4 d-flex justify-content-between">
        <div class="filter-group">
          <label for="locationFilter" class="font-semibold">Location:</label>
          <select id="locationFilter" class="form-select" [(ngModel)]="selectedLocation" (change)="applyFilter()">
            <option value="">All Locations</option>
            <option *ngFor="let location of locations" [value]="location">{{ location }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="cityFilter" class="font-semibold">City:</label>
          <select id="cityFilter" class="form-select" [(ngModel)]="selectedCity" (change)="applyFilter()">
            <option value="">All Cities</option>
            <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="countryFilter" class="font-semibold">Country:</label>
          <select id="countryFilter" class="form-select" [(ngModel)]="selectedCountry" (change)="applyFilter()">
            <option value="">All Countries</option>
            <option *ngFor="let country of countries" [value]="country">{{ country }}</option>
          </select>
        </div>
      </div>

      <!-- Warehouse List -->
      <table class="table table-bordered table-hover">
        <thead class="thead-dark">
          <tr>
            <th>#</th>
            <th>Warehouse Name</th>
            <th>Location</th>
            <th>City</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let warehouse of filteredWarehouses | paginate: { itemsPerPage: itemsPerPage, currentPage: page }; let i = index">
            <td>{{ (page - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ warehouse.warehousename }}</td>
            <td>{{ warehouse.location }}</td>
            <td>{{ warehouse.city }}</td>
            <td>{{ warehouse.country }}</td>
            <td>
              <button class="btn btn-warning" (click)="editWarehouse(warehouse)">Edit</button>
              <button class="btn btn-danger" (click)="deleteWarehouse(warehouse.warehouseid)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <pagination-controls (pageChange)="page = $event" [totalItems]="filteredWarehouses.length" [itemsPerPage]="itemsPerPage" maxSize="5" directionLinks="true"></pagination-controls>

      <div *ngIf="filteredWarehouses.length === 0" class="alert alert-warning mt-3">
        No warehouses found.
      </div>

      <!-- Add New Warehouse -->
      <button class="btn btn-primary mt-4" (click)="toggleForm()" style="position: absolute; top: 20px; right: 20px;">Add New Warehouse</button>

      <!-- Add Warehouse Form -->
      <div *ngIf="showForm" class="mt-5">
        <h3>{{ isEdit ? 'Edit Warehouse' : 'Add New Warehouse' }}</h3>
        <form (ngSubmit)="isEdit ? updateWarehouse() : addWarehouse()">
          <div class="form-group">
            <label for="warehousename">Warehouse Name:</label>
            <input id="warehousename" class="form-control" [(ngModel)]="currentWarehouse.warehousename" name="warehousename" required>
          </div>
          <div class="form-group">
            <label for="location">Location:</label>
            <input id="location" class="form-control" [(ngModel)]="currentWarehouse.location" name="location" required>
          </div>
          <div class="form-group">
            <label for="city">City:</label>
            <input id="city" class="form-control" [(ngModel)]="currentWarehouse.city" name="city" required>
          </div>
          <div class="form-group">
            <label for="country">Country:</label>
            <input id="country" class="form-control" [(ngModel)]="currentWarehouse.country" name="country" required>
          </div>
          <button type="submit" class="btn btn-primary mt-3">{{ isEdit ? 'Update Warehouse' : 'Add Warehouse' }}</button>
          <button type="button" class="btn btn-secondary mt-3" (click)="toggleForm()">Cancel</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px;
      position: relative;
    }
    .font-semibold {
      font-weight: 600;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    .table th, .table td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #dee2e6;
    }
    .thead-dark {
      background-color: #343a40;
      color: #fff;
    }
    .form-select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
    }
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
      padding: 10px;
      border-radius: 5px;
    }
    .table-hover tbody tr:hover {
      background-color: #f8f9fa;
    }
    .btn-success {
      background-color: #28a745;
      border-color: #28a745;
      color: white;
    }
  `]
})
export class WarehouseManagementComponent implements OnInit {
  warehouses: any[] = [];
  filteredWarehouses: any[] = [];
  locations: string[] = [];
  cities: string[] = [];
  countries: string[] = [];
  selectedLocation: string = '';
  selectedCity: string = '';
  selectedCountry: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  currentWarehouse: any = {
    warehousename: '',
    location: '',
    city: '',
    country: ''
  };
  showForm: boolean = false;
  isEdit: boolean = false; // To check if we are editing or adding a warehouse

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.http.get<any[]>('http://localhost:5000/warehouses').subscribe(
      data => {
        this.warehouses = data;
        this.filteredWarehouses = data;
        this.extractFilterData();
      },
      error => {
        console.error('Error loading warehouses:', error);
      }
    );
  }

  extractFilterData(): void {
    this.locations = Array.from(new Set(this.warehouses.map(item => item.location)));
    this.cities = Array.from(new Set(this.warehouses.map(item => item.city)));
    this.countries = Array.from(new Set(this.warehouses.map(item => item.country)));
  }

  applyFilter(): void {
    this.filteredWarehouses = this.warehouses.filter(item => {
      const matchesLocation = this.selectedLocation ? item.location === this.selectedLocation : true;
      const matchesCity = this.selectedCity ? item.city === this.selectedCity : true;
      const matchesCountry = this.selectedCountry ? item.country === this.selectedCountry : true;
      return matchesLocation && matchesCity && matchesCountry;
    });
  }

  addWarehouse(): void {
    this.http.post('http://localhost:5000/warehouses', this.currentWarehouse).subscribe(
      response => {
        console.log('Warehouse added successfully');
        this.loadWarehouses();
        this.toggleForm(); // Hide the form
      },
      error => {
        console.error('Error adding warehouse:', error);
      }
    );
  }

  editWarehouse(warehouse: any): void {
    this.currentWarehouse = { ...warehouse };
    this.isEdit = true;
    this.showForm = true;
  }

  updateWarehouse(): void {
    const warehouseId = this.currentWarehouse.warehouseid;
    this.http.put(`http://localhost:5000/warehouses/${warehouseId}`, this.currentWarehouse).subscribe(
      response => {
        console.log('Warehouse updated successfully');
        this.loadWarehouses();
        this.toggleForm(); // Hide the form
      },
      error => {
        console.error('Error updating warehouse:', error);
      }
    );
  }

  deleteWarehouse(warehouseId: number): void {
    this.http.delete(`http://localhost:5000/warehouses/${warehouseId}`).subscribe(
      response => {
        console.log('Warehouse deleted successfully');
        this.loadWarehouses();
      },
      error => {
        console.error('Error deleting warehouse:', error);
      }
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.currentWarehouse = {
      warehousename: '',
      location: '',
      city: '',
      country: ''
    };
    this.isEdit = false;
  }
}
