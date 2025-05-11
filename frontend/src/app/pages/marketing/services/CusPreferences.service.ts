import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class PreferencesService {
private apiUrl = 'http://localhost:5000/api/preferences/stats';

constructor(private http: HttpClient) {}

getStatistics(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
}
}
