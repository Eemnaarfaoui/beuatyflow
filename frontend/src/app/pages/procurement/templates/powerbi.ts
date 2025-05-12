import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PowerBiService } from '../services/power-bi.service';
import { AuthService } from '../../auth/service/auth.service';
import { PowerBIViewerComponent } from '../../sales/components/powerbi-viewer/powerbi-viewer.component';

@Component({
  selector: 'app-powerbi',
  standalone: true,
  imports: [CommonModule, PowerBIViewerComponent],
  template: `
    <div class="card">
      <ng-container *ngIf="isAuthorized; else unauthorizedTemplate">
        <app-powerbi-viewer ></app-powerbi-viewer>
      </ng-container>

      <ng-template #unauthorizedTemplate>
        <div class="text-center p-5 text-red-500 font-bold">
          You are not authorized to view this Power BI dashboard.
        </div>
      </ng-template>
    </div>
  `
})
export class PowerBiComponent implements OnInit {
  embedUrl: string | null = null;
  isAuthorized = false;
  availablePages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private powerBiService: PowerBiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Mapping route to the available pages
    const url = this.route.snapshot.pathFromRoot.map(seg => seg.routeConfig?.path).filter(Boolean).join('/');
    
    if (url.includes('sales')) {
      this.availablePages = ['Sales Overview', 'Regional Analysis'];
    } else if (url.includes('storage')) {
      this.availablePages = ['Storage Management', 'Warehouses Analysis'];
    } else if (url.includes('procurement')) {
      this.availablePages = ['Procurement'];
    } else if (url.includes('marketing')) {
      this.availablePages = ['Customer Analysis'];
    } else if (url.includes('ex_environment')) {
      this.availablePages = ['Competitors Analysis'];
    }

    const role = this.authService.getUserRole()?.toLowerCase();
    const userPages = this.authService.getUserPages() || [];

    if (role === 'admin') {
      this.isAuthorized = true;
      this.embedUrl = this.powerBiService.getEmbedUrl(this.availablePages[0]); // pick first page
    } else {
      const matchedPage = this.availablePages.find(page => userPages.includes(page));

      if (matchedPage) {
        this.isAuthorized = true;
        this.embedUrl = this.powerBiService.getEmbedUrl(matchedPage);
      } else {
        this.isAuthorized = false;
      }
    }
  }
}
