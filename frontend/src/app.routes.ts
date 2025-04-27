import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/auth.guard';
import { PageAccessGuard } from './app/core/pages.guard'; // <-- page-access.guard you created

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },

            { 
                path: 'sales', 
                canActivate: [PageAccessGuard], 
                data: { requiredRole: 'sales manager' }, 
                loadChildren: () => import('./app/pages/sales/sales.routes') 
            },
            { 
                path: 'storage', 
                canActivate: [PageAccessGuard], 
                data: { requiredRole: 'logistics manager' }, 
                loadChildren: () => import('./app/pages/storage/storage.routes') 
            },
            { 
                path: 'procurement', 
                canActivate: [PageAccessGuard], 
                data: { requiredRole: 'procurement manager' }, 
                loadChildren: () => import('./app/pages/procurement/procurement.routes') 
            },
            { 
                path: 'marketing', 
                canActivate: [PageAccessGuard], 
                data: { requiredRole: 'marketing manager' }, 
                loadChildren: () => import('./app/pages/marketing/marketing.routes') 
            },
            { 
                path: 'ex_environment', 
                canActivate: [PageAccessGuard], 
                data: { requiredRole: 'competition monitoring manager' }, 
                loadChildren: () => import('./app/pages/ex_environment/ex_environment.routes') 
            },
            { 
                path: 'admin', 
                loadChildren: () => import('./app/pages/user_management/admin.routes') 
            }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
