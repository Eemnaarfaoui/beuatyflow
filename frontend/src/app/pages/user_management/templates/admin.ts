import { Component } from '@angular/core';
import { UsersTable } from "../components/usersTable";
import { ButtonModule } from 'primeng/button';
import { UsersFormComponent } from "../components/userForm";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-admin-panel',
  standalone: true,
  imports: [
    UsersTable,
    ButtonModule,
    UsersFormComponent,
    CommonModule
  ],
  template: `
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <div class="font-semibold text-xl">
        {{ showForm ? (editingUser ? 'Edit User' : 'Add New User') : 'Users Management' }}
      </div>

      <button
        pButton
        label="{{ showForm ? 'User List' : 'Add New User' }}"
        icon="{{ showForm ? 'pi pi-users' : 'pi pi-plus' }}"
        (click)="toggleView()"
        class="p-button-success">
      </button>
    </div>

    <ng-container *ngIf="!showForm">
      <app-users-table (editRequested)="onEditUser($event)"></app-users-table>
    </ng-container>

    <ng-container *ngIf="showForm">
      <app-user-form [user]="editingUser" (done)="onDone()"></app-user-form>
    </ng-container>
  </div>
  `,
})
export class AdminPanelComponent {
  showForm = false;
  editingUser: any = null; // null = add mode, user object = edit mode

  toggleView() {
    this.showForm = !this.showForm;
    this.editingUser = null; // reset editing when toggling manually
  }

  onEditUser(user: any) {
    this.editingUser = user;
    this.showForm = true;
  }

  onDone() {
    this.showForm = false;
    this.editingUser = null;
  }
}
