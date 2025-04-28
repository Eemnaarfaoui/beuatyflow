// src/app/core/services/warehouse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = 'http://localhost:5000'; // Ton backend Flask local

  constructor(private http: HttpClient) {}

  // Lire tous les inventaires (avec option filtre possible)
  getInventory(warehouseName?: string): Observable<any[]> {
    const url = warehouseName ? `${this.apiUrl}/inventory?warehouse_name=${warehouseName}` : `${this.apiUrl}/inventory`;
    return this.http.get<any[]>(url);
  }

  // Ajouter un nouvel inventaire
  addInventory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory`, data);
  }

  // Mettre à jour un inventaire existant
  updateInventory(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventory`, data);
  }

  // Supprimer un inventaire
  deleteInventory(data: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory`, { body: data });
  }
}
