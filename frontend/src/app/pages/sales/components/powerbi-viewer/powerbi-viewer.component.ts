import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../pipes/safe.pipe';

@Component({
  selector: 'app-powerbi-viewer',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    <div class="powerbi-container">
      <iframe 
        *ngIf="embedUrl"
        [src]="embedUrl | safe"
        width="100%"
        height="800px"
        frameborder="0"
        allowfullscreen
        allow="clipboard-write"
        style="border: none;"
       >
      </iframe>
    </div>
  `,
  styles: [`
    .powerbi-container {
      width: 100%;
     height: 730px; overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class PowerBIViewerComponent {
  //@Input() embedUrl: string | null = ''; // ✅ Correct: receive the URL from parent
  public embedUrl = 'https://app.powerbi.com/reportEmbed?reportId=2b1e2547-a043-443e-85e7-02a5406906aa&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730';

}
