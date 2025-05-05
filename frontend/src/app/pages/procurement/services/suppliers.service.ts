import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface SupplierReliabilityData {
  supplier_FK: number;
  Reliability_Category: string;
  Score_Fiabilite_Achat: number;
}


@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private apiUrl = 'http://localhost:5000/ml/reliability';
  constructor(private http: HttpClient) {}

  getSupplierReliability(): Observable<SupplierReliabilityData[]> {
    return this.http.get<SupplierReliabilityData[]>(this.apiUrl);
  }
}