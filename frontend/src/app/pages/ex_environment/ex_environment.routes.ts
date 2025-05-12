import { Routes } from '@angular/router';
import { ExProductsComponent } from './templates/ex_products';
import { ExEnvSuppliersComponent } from './templates/ex_suppliers';
import { ExEnvShopsComponent } from './templates/ex_shops';
import { PowerBiComponent } from './templates/powerbi';
import { PowerBIViewerComponent } from './components/powerbi-viewer/powerbi-viewer.component';


export default [
    { path: 'ex-products', data: { breadcrumb: 'Ex-Products' }, component: ExProductsComponent },
    { path: 'ex-suppliers', data: { breadcrumb: 'Ex-Suppliers' }, component: ExEnvSuppliersComponent},
    { path: 'ex-shops', data: { breadcrumb: 'Ex-Shops' }, component: ExEnvShopsComponent },
    { path: 'powerbi', data: { breadcrumb: 'Ex-powerbi' }, component:PowerBIViewerComponent  },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
