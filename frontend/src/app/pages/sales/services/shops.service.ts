
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Shop } from '../models/shops';

@Injectable({ providedIn: 'root' })
export class ShopService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
getAllShops() {
    return this.http.get<any>(`${this.apiUrl}/get-sales-shops`);
}

  addShop(data: any) {
    return this.http.post(`${this.apiUrl}/sales-add-shop`, data);
  }

  updateShop(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/update-shop/${id}`, data);
  }

  deleteShop(id: string) {
    return this.http.delete(`${this.apiUrl}/delete-shop/${id}`);
  }
}
