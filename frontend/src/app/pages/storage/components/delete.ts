import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <button
      pButton
      icon="pi pi-trash"
      [rounded]="true"
      [text]="true"
      severity="danger"
      (click)="openConfirmation()"
    ></button>

    <p-dialog
      header="Confirmation"
      [(visible)]="displayConfirmation"
      [modal]="true"
      [style]="{ width: '350px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-2xl text-red-500"></i>
        <span>Are you sure you want to delete this record?</span>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="No" icon="pi pi-times" (click)="closeConfirmation()" class="p-button-text"></button>

        <!-- For Warehouse -->
        <button *ngIf="warehouseId !== undefined"
          pButton label="Yes" icon="pi pi-check" 
          (click)="confirmWarehouseDelete()" 
          class="p-button-danger"></button>

        <!-- For Inventory -->
        <button *ngIf="Warehouse_ID !== undefined"
          pButton label="Yes" icon="pi pi-check" 
          (click)="confirmInventoryDelete()" 
          class="p-button-danger"></button>
      </ng-template>
    </p-dialog>
  `
})
export class DeleteComponent {
  displayConfirmation = false;

  // Warehouse ID: number
  @Input() warehouseId?: number;
  @Output() confirmedDelete = new EventEmitter<number>();

  // Warehouse_ID: String
  @Input() Warehouse_ID?: string;
  @Output() confirmedInventoryDelete = new EventEmitter<string>();

  openConfirmation() {
    this.displayConfirmation = true;
  }

  closeConfirmation() {
    this.displayConfirmation = false;
  }

  confirmWarehouseDelete() {
    if (this.warehouseId !== undefined) {
      this.confirmedDelete.emit(this.warehouseId);
    }
    this.closeConfirmation();
  }

  confirmInventoryDelete() {
    if (this.Warehouse_ID !== undefined) {
      this.confirmedInventoryDelete.emit(this.Warehouse_ID);
    }
    this.closeConfirmation();
  }
}
