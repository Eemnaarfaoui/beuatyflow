import { Routes } from '@angular/router';
import { CustomerPersonaComponent } from './templates/customerPersona';
import { PreferencesComponent } from './templates/preferences';


export default [
    { path: 'customerpersona', data: { breadcrumb: 'Customer-Persona' }, component: CustomerPersonaComponent },
    { path: 'preferences', data: { breadcrumb: 'Preferences' }, component: PreferencesComponent },
    { path: 'powerbi', data: { breadcrumb: 'MarPowerBi' }, component: PreferencesComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
