
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { warehouse } from '../models/warehouses';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
getAllWarehouses() {
    return this.http.get<any>(`${this.apiUrl}/get-storage-warehouse`);
}

  addWarehouse(data: any) {
    return this.http.post(`${this.apiUrl}/storage-add-warehouse`, data);
  }

  updateWarehouse(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/update-warehouse/${id}`, data);
  }

  deleteWarehouse(id: number) {
    return this.http.delete(`${this.apiUrl}/delete-warehouse/${id}`);
  }

getInventory(){
  return this.http.get<any>(`${this.apiUrl}/get-inventory`);
}
}
