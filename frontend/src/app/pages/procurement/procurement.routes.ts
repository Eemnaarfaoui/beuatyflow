import { Routes } from '@angular/router';
import { ProductsComponent } from './templates/products';
import { PowerBiComponent } from './templates/powerbi';
import { SuppliersComponent } from './components/suppliers/suppliers.component';


export default [
    { path: 'products', data: { breadcrumb: 'Products' }, component: ProductsComponent },
    { path: 'suppliers', data: { breadcrumb: 'Suppliers' }, component: SuppliersComponent },
    { path: 'powerbi', data: { breadcrumb: 'ProcPowerBi' }, component: PowerBiComponent },
    
    { path: '**', redirectTo: '/notfound' }
] as Routes;