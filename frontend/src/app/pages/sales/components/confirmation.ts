import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule
  ],
  template: `
    <p-dialog 
      header="Success" 
      [(visible)]="display" 
      [breakpoints]="{ '960px': '75vw' }" 
      [style]="{ width: '30vw' }" 
      [modal]="true">

      <p class="leading-normal m-0">
        {{ message }}
      </p>

      <ng-template #footer>
        <p-button label="OK" (click)="close()" autofocus />
      </ng-template>

    </p-dialog>
  `
})
export class ConfirmComponent {
  @Input() message: string = 'Operation successful.'; // custom message
  @Output() closed = new EventEmitter<void>(); // inform parent on close

  display: boolean = false;

  open() {
    this.display = true;
  }

  close() {
    this.display = false;
    this.closed.emit();
  }
}
