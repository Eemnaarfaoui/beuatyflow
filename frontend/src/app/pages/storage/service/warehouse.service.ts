import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = 'http://localhost:5000/warehouses';  // URL de votre API Flask

  constructor(private http: HttpClient) {}

  // Récupérer tous les entrepôts
  getWarehouses(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Ajouter un entrepôt
  addWarehouse(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Mettre à jour un entrepôt
  updateWarehouse(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Supprimer un entrepôt
  deleteWarehouse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
