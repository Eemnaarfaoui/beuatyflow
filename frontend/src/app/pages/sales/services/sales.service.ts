
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Shop } from '../models/shops';

@Injectable({ providedIn: 'root' })
export class SalesService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
getSales() {
    return this.http.get<any>(`${this.apiUrl}/get-sales-data`);
}

predictSales() {
    return this.http.get<any>(`${this.apiUrl}/sales-forecast`);
}

}

