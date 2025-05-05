import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';


@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
getKpis() {
    return this.http.get<any>(`${this.apiUrl}/get-kpis`);
} 
}