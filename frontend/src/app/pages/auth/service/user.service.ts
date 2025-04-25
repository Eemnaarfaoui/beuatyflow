
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get('/api/users/me');
  }

  updateMe(data: any) {
    return this.http.put('/api/users/me', data);
  }

  getAllUsers() {
    return this.http.get('/api/users');
  }

  getUserById(id: string) {
    return this.http.get(`/api/users/${id}`);
  }

  addUser(data: any) {
    return this.http.post('/api/users', data);
  }

  updateUser(id: string, data: any) {
    return this.http.put(`/api/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`/api/users/${id}`);
  }
}
