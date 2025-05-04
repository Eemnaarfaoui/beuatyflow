// app.routes.ts
import { Routes } from '@angular/router';
import { WarehousesComponent } from './templates/warehouses';
import { PowerBiComponent } from './templates/powerbi';


export default [
  { path: 'warehouses', data: { breadcrumb: 'Warehouses' }, component: WarehousesComponent },

  { path: 'powerbi', data: { breadcrumb: 'StoPowerBi' }, component: PowerBiComponent },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
