import { Routes } from '@angular/router';
import { ProductsComponent } from './templates/products';
import { ShopsComponent } from './templates/shops';
import { PowerBiComponent } from './templates/powerbi';
import { OrdersComponent } from './templates/orders';

export default [
    { path: 'products', data: { breadcrumb: 'Products' }, component: ProductsComponent },
    { path: 'shops', data: { breadcrumb: 'Shops' }, component: ShopsComponent },
    { path: 'powerbi', data: { breadcrumb: 'SaPowerBi' }, component:  PowerBiComponent },
    { path: 'orders', data: { breadcrumb: 'Orders' }, component: OrdersComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
