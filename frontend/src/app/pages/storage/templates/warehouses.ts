import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // Corrigé
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgxPaginationModule], // Corrigé
  template: `
    <div class="card">
      <div class="font-semibold text-xl mb-4">Inventory Management</div>

      <!-- Filters in a single row -->
      <div class="mb-4 d-flex justify-content-between">
        <div class="filter-group">
          <label for="warehouseFilter" class="font-semibold">Warehouse:</label>
          <select id="warehouseFilter" class="form-select" [(ngModel)]="selectedWarehouse" (change)="applyFilter()">
            <option value="">All Warehouses</option>
            <option *ngFor="let warehouse of warehouseNames" [value]="warehouse">{{ warehouse }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="productFilter" class="font-semibold">Product:</label>
          <select id="productFilter" class="form-select" [(ngModel)]="selectedProduct" (change)="applyFilter()">
            <option value="">All Products</option>
            <option *ngFor="let product of productNames" [value]="product">{{ product }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="locationFilter" class="font-semibold">Location:</label>
          <select id="locationFilter" class="form-select" [(ngModel)]="selectedLocation" (change)="applyFilter()">
            <option value="">All Locations</option>
            <option *ngFor="let location of locations" [value]="location">{{ location }}</option>
          </select>
        </div>
      </div>

      <table class="table table-bordered table-hover">
        <thead class="thead-dark">
          <tr>
            <th>#</th>
            <th>Warehouse Name</th>
            <th>Location</th>
            <th>Product ID</th>
            <th>Quantity</th>
            <th>Product Name</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of filteredInventory | paginate: { itemsPerPage: itemsPerPage, currentPage: page } ; let i = index">
            <td>{{ (page - 1) * itemsPerPage + i + 1 }}</td>
            <td>{{ item.Warehouse_Name }}</td>
            <td>{{ item.Location }}</td>
            <td>{{ item.Product_ID }}</td>
            <td>{{ item.Quantity }}</td>
            <td>{{ item.productname }}</td>
          </tr>
        </tbody>
      </table>

      <!-- <pagination-controls (pageChange)="page = $event" [totalItems]="filteredInventory.length" [itemsPerPage]="itemsPerPage" maxSize="5" directionLinks="true"></pagination-controls> -->

      <div *ngIf="filteredInventory.length === 0" class="alert alert-warning mt-3">
        Aucun résultat trouvé.
      </div>

      <button class="btn btn-success mt-4" (click)="exportToExcel()">Download as Excel</button>

      <!-- Button to toggle add inventory form -->
      <button class="btn btn-primary mt-4" (click)="toggleForm()" style="position: absolute; top: 20px; right: 20px;">Add New Inventory</button>

      <!-- Add new inventory form -->
      <div *ngIf="showForm" class="mt-5">
        <h3>Add New Inventory</h3>
        <form (ngSubmit)="addInventory()">
          <div class="form-group">
            <label for="newWarehouseName">Warehouse Name:</label>
            <select id="newWarehouseName" class="form-select" [(ngModel)]="newInventory.Warehouse_Name" name="Warehouse_Name" (change)="onWarehouseChange()" required>
              <option value="">Select Warehouse</option>
              <option *ngFor="let warehouse of warehouseNames" [value]="warehouse">{{ warehouse }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="newLocation">Location:</label>
            <input id="newLocation" class="form-control" [(ngModel)]="newInventory.Location" name="Location" [readonly]="true" required>
          </div>
          <div class="form-group">
            <label for="newProductID">Product ID:</label>
            <input id="newProductID" class="form-control" type="number" [(ngModel)]="newInventory.Product_ID" name="Product_ID" required>
          </div>
          <div class="form-group">
            <label for="newQuantity">Quantity:</label>
            <input id="newQuantity" class="form-control" type="number" [(ngModel)]="newInventory.Quantity" name="Quantity" required>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Add Item</button>
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

    .text-xl {
      font-size: 1.25rem;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .table th,
    .table td {
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

    /* Style for filters to be in a row */
    .d-flex {
      display: flex;
      justify-content: space-between;
      gap: 1rem; /* Adjust space between filters */
    }

    .filter-group {
      width: 30%; /* Ensure the filters take up equal width */
    }

    .filter-group label {
      display: block;
      margin-bottom: 5px;
    }

    /* Style for the form */
    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
    }
  `]
})
export class InventoryComponent implements OnInit {
  inventory: any[] = [];
  filteredInventory: any[] = [];
  warehouseNames: string[] = [];
  productNames: string[] = [];
  locations: string[] = [];
  selectedWarehouse: string = '';
  selectedProduct: string = '';
  selectedLocation: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  newInventory: any = {
    Warehouse_Name: '',
    Location: '',
    Product_ID: null,
    Quantity: null
  };
  showForm: boolean = false; // Variable to control form visibility
  warehouseLocations: { [key: string]: string } = {}; // Mapping of warehouses to locations

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.http.get<any[]>('http://localhost:5000/inventory').subscribe(
      data => {
        this.inventory = data;
        this.filteredInventory = data;
        this.extractFilterData();
      },
      error => {
        console.error('Erreur lors du chargement de l\'inventory:', error);
      }
    );
  }

  extractFilterData(): void {
    this.warehouseNames = Array.from(new Set(this.inventory.map(item => item.Warehouse_Name)));
    this.productNames = Array.from(new Set(this.inventory.map(item => item.productname)));
    this.locations = Array.from(new Set(this.inventory.map(item => item.Location)));

    // Create a map of warehouses to locations for easy lookup
    this.warehouseLocations = this.inventory.reduce((acc, item) => {
      acc[item.Warehouse_Name] = item.Location;
      return acc;
    }, {});
  }

  applyFilter(): void {
    this.filteredInventory = this.inventory.filter(item => {
      const matchesWarehouse = this.selectedWarehouse ? item.Warehouse_Name === this.selectedWarehouse : true;
      const matchesProduct = this.selectedProduct ? item.productname === this.selectedProduct : true;
      const matchesLocation = this.selectedLocation ? item.Location === this.selectedLocation : true;

      return matchesWarehouse && matchesProduct && matchesLocation;
    });
  }

  addInventory(): void {
    // Send new inventory item to the backend
    this.http.post('http://localhost:5000/inventory', this.newInventory).subscribe(
      response => {
        console.log('Données ajoutées avec succès', response);
        this.loadInventory(); // Reload the inventory after adding the new item
        this.resetForm(); // Reset the form after submission
        this.showForm = false; // Hide the form after submission
      },
      error => {
        console.error('Erreur lors de l\'ajout de l\'inventaire:', error);
      }
    );
  }

  onWarehouseChange(): void {
    // Automatically set location when warehouse is selected
    if (this.newInventory.Warehouse_Name) {
      this.newInventory.Location = this.warehouseLocations[this.newInventory.Warehouse_Name] || '';
    }
  }

  resetForm(): void {
    this.newInventory = {
      Warehouse_Name: '',
      Location: '',
      Product_ID: null,
      Quantity: null
    };
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredInventory);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory.xlsx');
  }

  // Function to toggle the visibility of the form
  toggleForm(): void {
    this.showForm = !this.showForm;
  }
}
