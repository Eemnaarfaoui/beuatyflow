import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule
  ],
  template: `
    <p-button 
      icon="pi pi-trash" 
      [rounded]="true" 
      [text]="true" 
      severity="danger" 
      (click)="openConfirmation()" 
    ></p-button>

    <p-dialog header="Confirmation" [(visible)]="displayConfirmation" [style]="{ width: '350px' }" [modal]="true">
      <div class="flex items-center justify-center">
        <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem"></i>
        <span>Are you sure you want to delete this user?</span>
      </div>

      <ng-template #footer>
        <p-button label="No" icon="pi pi-times" (click)="closeConfirmation()" text severity="secondary" />
        <p-button label="Yes" icon="pi pi-check" (click)="confirmDelete()" severity="danger" outlined autofocus />
      </ng-template>
    </p-dialog>
  `,
})
export class DeleteComponent {
  @Input() userId!: string; // the id of the user to delete
  @Output() confirmedDelete = new EventEmitter<string>(); // emit back the id if confirmed

  displayConfirmation: boolean = false;

  openConfirmation() {
    this.displayConfirmation = true;
  }

  closeConfirmation() {
    this.displayConfirmation = false;
  }

  confirmDelete() {
    this.confirmedDelete.emit(this.userId);
    this.displayConfirmation = false;
  }
}
