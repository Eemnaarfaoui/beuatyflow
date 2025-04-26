import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { UserService } from '../services/user.service';
import { ConfirmComponent } from './confirmation';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    MultiSelectModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    SelectModule,
    FluidModule,
    ConfirmComponent // <--- Import here too
  ],
  template: `
  <div class="md:w-1/2">
    <div class="card flex flex-col gap-4">

      <app-confirmation 
        [message]="confirmationMessage"
        (closed)="onConfirmationClosed()"
        #confirmationDialog
      ></app-confirmation>

      <div class="flex flex-col gap-2">
        <label for="email">Email</label>
        <input pInputText id="email" type="text" [(ngModel)]="email" name="email" placeholder="Enter user email" />
        <small *ngIf="submitted && !email" class="text-red-500">Email is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="role">Role</label>
        <p-select 
          id="role" 
          [(ngModel)]="selectedRole"
          [options]="roleOptions"
          optionLabel="label"
          optionValue="value" 
          name="role" 
          placeholder="Select Role" 
          class="w-full">
        </p-select>
        <small *ngIf="submitted && !selectedRole" class="text-red-500">Role is required</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="pages">Pages</label>
        <p-multiselect
          id="pages"
          [options]="pageOptions"
          [(ngModel)]="selectedPages"
          name="pages"
          placeholder="Select Pages"
          optionLabel="name"
          display="chip"
          [filter]="true">
        </p-multiselect>
        <small *ngIf="submitted && (!selectedPages || selectedPages.length === 0)" class="text-red-500">At least one page must be selected</small>
      </div>

      <p-button label="Submit" (click)="submitUser()" [disabled]="loading" [fluid]="false"></p-button>
    </div>
  </div>
  `
})
export class UsersFormComponent {
  @Input() user: any = null;
  @Output() done = new EventEmitter<void>();

  @ViewChild('confirmationDialog') confirmationDialog!: ConfirmComponent;

  email: string = '';
  selectedRole: string | null = null;
  selectedPages: any[] = [];

  confirmationMessage: string = '';
  loading = false;
  submitted = false;

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Logistics Manager', value: 'Logistics Manager' },
    { label: 'Sales Manager', value: 'Sales Manager' },
    { label: 'Procurement Manager', value: 'Procurement Manager' },
    { label: 'Marketing Manager', value: 'Marketing Manager' },
    { label: 'Competition Monitoring Manager', value: 'Competition Monitoring Manager' }
  ];

  pageOptions = [
    { name: 'Storage Management' },
    { name: 'Warehouses Analysis' },
    { name: 'Sales Overview' },
    { name: 'Regional Analysis' },
    { name: 'Procurement' },
    { name: 'Competitors Analysis' },
    { name: 'Customer Analysis' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    if (this.user) {
      this.email = this.user.email;
      this.selectedRole = this.user.role;
      this.selectedPages = this.user.pages.map((page: string) => ({ name: page }));
    }
  }

  submitUser() {
    this.submitted = true;

    if (!this.email || !this.selectedRole || !this.selectedPages.length) {
      console.warn('Validation failed');
      return;
    }

    const payload = {
      email: this.email,
      role: this.selectedRole,
      pages: this.selectedPages.map(page => page.name)
    };

    this.loading = true;

    if (this.user) {
      // Update
      this.userService.updateUser(this.user._id, payload).subscribe({
        next: (res) => {
          console.log('User updated successfully:', res);
          this.confirmationMessage = 'User updated successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          alert('Failed to update user.');
          this.loading = false;
        }
      });
    } else {
      // Create
      this.userService.addUser(payload).subscribe({
        next: (res) => {
          console.log('User created successfully:', res);
          this.confirmationMessage = 'User created successfully!';
          this.confirmationDialog.open();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to create user:', err);
          alert('Failed to create user.');
          this.loading = false;
        }
      });
    }
  }

  onConfirmationClosed() {
    this.done.emit(); // tell Admin Panel to go back to the user list
  }
}
