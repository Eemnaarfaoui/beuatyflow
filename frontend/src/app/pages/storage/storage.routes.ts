// app.routes.ts
import { Routes } from '@angular/router';
import { WarehousesComponent } from './templates/warehouses';
import { PowerBiComponent } from './templates/powerbi';
import { InventoryComponent } from './templates/inventory';

export default [
  { path: 'warehouses', data: { breadcrumb: 'Warehouses' }, component: WarehousesComponent },
  {path: 'inventory', data: { breadcrumb: 'Inventory' }, component: InventoryComponent},
  { path: 'powerbi', data: { breadcrumb: 'StoPowerBi' }, component: PowerBiComponent },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
