import { Component, Input } from '@angular/core';
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
        style="border: none;">
      </iframe>
    </div>
  `,
  styles: [`
    .powerbi-container {
      width: 100%;
      height: 730px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class PowerBIViewerComponent {
  //@Input() embedUrl: string | null = ''; // ✅ Correct: receive the URL from parent
 public embedUrl= 'https://app.powerbi.com/reportEmbed?reportId=f6e55757-1a41-44db-ac19-94f030d27931&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730'
}
