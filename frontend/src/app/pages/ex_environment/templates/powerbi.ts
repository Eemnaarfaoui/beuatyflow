import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-storage-powerbi',
  template: `
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12">
        <iframe 
          [src]="safePowerBIUrl" 
          frameborder="0" 
          allowfullscreen="true">
        </iframe>
      </div>
    </div>
  `,
  styles: [`
    iframe {
      border: none;
      width: 100%;
      height: 100vh; /* Hauteur = toute la hauteur de l'écran */
      display: block;
      margin: 0 auto;
    }
  `]
})
export class ExEnvPowerBiComponent {
  powerBIUrl: string = 'https://app.powerbi.com/reportEmbed?reportId=f6e55757-1a41-44db-ac19-94f030d27931&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730';
  safePowerBIUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.safePowerBIUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.powerBIUrl);
  }
}