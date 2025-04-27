import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../services/user.service';
import { DeleteComponent } from '../components/delete'; // <--- import DeleteComponent

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    RippleModule,
    ButtonModule,
    DeleteComponent // <--- Add it here
  ],
  template: `
    <p-table
      #dt
      [value]="users"
      dataKey="_id"
      [rows]="10"
      [loading]="loading"
      [rowHover]="true"
      [showGridlines]="true"
      [paginator]="true"
      [globalFilterFields]="['email', 'role', 'pages']"
      responsiveLayout="scroll"
    >
      <ng-template #caption>
        <div class="flex justify-between items-center flex-column sm:flex-row">
          <button pButton label="Clear Filters" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
          <div class="ml-auto">
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
          </div>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          <th style="min-width: 20rem">
            <div class="flex justify-between items-center">
              Email
              <p-columnFilter type="text" field="email" display="menu" placeholder="Search by email"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 15rem">
            <div class="flex justify-between items-center">
              Role
              <p-columnFilter type="text" field="role" display="menu" placeholder="Search by role"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 25rem">
            <div class="flex justify-between items-center">
              Pages
              <p-columnFilter type="text" field="pages" display="menu" placeholder="Search by page"></p-columnFilter>
            </div>
          </th>
          <th style="min-width: 8rem">Actions</th>
        </tr>
      </ng-template>

      <ng-template #body let-user>
        <tr>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.pages?.join(', ') }}</td>
          <td class="flex gap-2">
            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="success" (onClick)="editUser(user)" />
            <app-delete [userId]="user._id" (confirmedDelete)="deleteUser($event)"></app-delete>
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="4">No users found.</td>
        </tr>
      </ng-template>

      <ng-template #loadingbody>
        <tr>
          <td colspan="4">Loading users. Please wait...</td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class UsersTable implements OnInit {
  users: any[] = [];
  loading: boolean = true;

  @Output() editRequested = new EventEmitter<any>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  editUser(user: any) {
    this.editRequested.emit(user);
  }

  deleteUser(userId: string) {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
      }
    });
  }
}
