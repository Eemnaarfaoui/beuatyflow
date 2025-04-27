import { Routes } from '@angular/router';
import { AdminPanelComponent } from './templates/admin';


export default [
    { path: '', data: { breadcrumb: 'admin-panel' }, component:AdminPanelComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
