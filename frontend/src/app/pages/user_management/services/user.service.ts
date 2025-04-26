
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
  

  getMe() {
    return this.http.get(`${this.apiUrl}/users/me`);
  }

  updateMe(data: any) {
    return this.http.put(`${this.apiUrl}/users/me`, data);
  }

  getAllUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUserById(id: string) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  addUser(data: any) {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}
