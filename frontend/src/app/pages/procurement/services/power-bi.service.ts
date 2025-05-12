import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PowerBiService {

  private embedUrls: { [key: string]: string } = {
    'Storage Management': 'https://app.powerbi.com/reportEmbed?f6e55757-1a41-44db-ac19-94f030d27931/8c32a1a06a8ce57caac9?ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&experience=power-bi',
    'Warehouses Analysis': 'https://app.powerbi.com/groups/me/reports/f6e55757-1a41-44db-ac19-94f030d27931/4fbfdb23440221b21d6e?ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&experience=power-bi',
    'Sales Overview': 'https://app.powerbi.com/reportEmbed?reportId=f6e55757-1a41-44db-ac19-94f030d27931&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&pageName=ReportSection123abc',
    'Procurement': 'https://app.powerbi.com/links/ldNqri8wD6?ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&pbi_source=linkShare&bookmarkGuid=1bb7bfbb-d448-4b31-b8fe-2494d797768a',
    'Competitors Analysis': 'https://app.powerbi.com/groups/me/reports/f6e55757-1a41-44db-ac19-94f030d27931/8c32a1a06a8ce57caac9?ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&experience=power-bi',
    'Customer Analysis': 'https://app.powerbi.com/groups/me/reports/f6e55757-1a41-44db-ac19-94f030d27931/f01a07fcc509bb5fec2a?ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730&experience=power-bi'
  };

  constructor() {}

  getEmbedUrl(pageName: string): string | null {
    return this.embedUrls[pageName] || null;
  }
}
