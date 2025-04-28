import { Routes } from '@angular/router';
import { WarehouseManagementComponent } from './templates/products';
import { InventoryComponent } from './templates/warehouses';
import { InvoicesComponent } from './templates/invoices';
import { PowerBiComponent } from './templates/powerbi';



export default [
    { path: 'products', data: { breadcrumb: 'Products' }, component: WarehouseManagementComponent },
    { path: 'warehouses', data: { breadcrumb: 'Warehouses' }, component: InventoryComponent },
    { path: 'invoices', data: { breadcrumb: 'Invoices' }, component: InvoicesComponent },
    { path: 'powerbi', data: { breadcrumb: 'StoPowerBi' }, component: PowerBiComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
