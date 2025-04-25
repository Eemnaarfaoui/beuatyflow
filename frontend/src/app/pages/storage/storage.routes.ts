import { Routes } from '@angular/router';
import { ProductsWareComponent } from './templates/products';
import { WarehouseComponent } from './templates/warehouses';
import { InvoicesComponent } from './templates/invoices';
import { PowerBiComponent } from './templates/powerbi';


export default [
    { path: 'products', data: { breadcrumb: 'Products' }, component: ProductsWareComponent },
    { path: 'warehouses', data: { breadcrumb: 'Warehouses' }, component: WarehouseComponent },
    { path: 'invoices', data: { breadcrumb: 'Invoices' }, component: InvoicesComponent },
    { path: 'powerbi', data: { breadcrumb: 'StoPowerBi' }, component: PowerBiComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
