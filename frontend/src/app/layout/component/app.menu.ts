import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../pages/auth/service/auth.service'; // import your auth service

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `
})
export class AppMenu {
  model: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const userRole = this.authService.getUserRole()?.toLowerCase();
    const userPages = this.authService.getUserPages();

    this.model = [
      {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },{ label: 'Chatbot', icon: 'pi pi-fw pi-prime', routerLink: ['/chatboot'] }]
      },
      {
        label: 'Departments',
        items: []
      },
      
    ];

 // Build Departments menu dynamically
 if (userRole === 'admin' ) {
    this.model!.push({
        
            label: 'Settings',
            items: [{ label: 'Admin', icon: 'pi pi-fw pi-home', routerLink: ['/admin'] }]
          
    });
  }


    // Build Departments menu dynamically
    if (userRole === 'admin' || userRole==='sales manager') {
      this.model[1].items!.push({
        label: 'Sales',
        icon: 'pi pi-fw pi-shopping-bag',
        items: [
          {label: 'Overview', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/sales/overview']},
        //  { label: 'Products', icon: 'pi pi-fw pi-warehouse', routerLink: ['/sales/products'] },
          { label: 'Shops', icon: 'pi pi-fw pi-warehouse', routerLink: ['/sales/shops'] },
          { label: 'Orders', icon: 'pi pi-fw pi-warehouse', routerLink: ['/sales/orders'] },
          { label: 'Power BI', icon: 'pi pi-fw pi-warehouse', routerLink: ['/sales/powerbi'] }
        ]
      });
    }

    if (userRole === 'admin' || userRole==='logistics manager') {
      this.model[1].items!.push({
        label: 'Storage',
        icon: 'pi pi-fw pi-warehouse',
        items: [
          { label: 'Inventory', icon: 'pi pi-fw pi-warehouse', routerLink: ['/storage/inventory'] },
          { label: 'Warehouses', icon: 'pi pi-fw pi-warehouse', routerLink: ['/storage/warehouses'] },
         // { label: 'Invoices', icon: 'pi pi-fw pi-warehouse', routerLink: ['/storage/invoices'] },
          { label: 'Power BI', icon: 'pi pi-fw pi-warehouse', routerLink: ['/storage/powerbi'] }
        ]
      });
    }

    if (userRole === 'admin' || userRole==='procurement manager') {
      this.model[1].items!.push({
        label: 'Procurement',
        icon: 'pi pi-fw pi-objects-column',
        items: [
          { label: 'Suppliers', icon: 'pi pi-fw pi-warehouse', routerLink: ['/procurement/suppliers'] },
          { label: 'Products', icon: 'pi pi-fw pi-warehouse', routerLink: ['/procurement/products'] },
          { label: 'Power BI', icon: 'pi pi-fw pi-warehouse', routerLink: ['/procurement/powerbi'] }
        ]
      });
    }

    if (userRole === 'admin' || userRole ==='marketing manager') {
      this.model[1].items!.push({
        label: 'Marketing',
        icon: 'pi pi-fw pi-megaphone',
        items: [
          { label: 'Preferences', icon: 'pi pi-fw pi-warehouse', routerLink: ['/marketing/preferences'] },
          { label: 'Customer Persona', icon: 'pi pi-fw pi-warehouse', routerLink: ['/marketing/customerpersona'] },
          { label: 'Power BI', icon: 'pi pi-fw pi-warehouse', routerLink: ['/marketing/powerbi'] }
        ]
      });
    }

    if (userRole === 'admin' || userPages.includes('competition monitoring manager')) {
      this.model[1].items!.push({
        label: 'External Environment',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'External Shops', icon: 'pi pi-fw pi-warehouse', routerLink: ['/ex_environment/ex-shops'] },
          { label: 'External Suppliers', icon: 'pi pi-fw pi-warehouse', routerLink: ['/ex_environment/ex-suppliers'] },
          { label: 'Products on the market', icon: 'pi pi-fw pi-warehouse', routerLink: ['/ex_environment/ex-products'] },
          { label: 'Power BI', icon: 'pi pi-fw pi-warehouse', routerLink: ['/ex_environment/powerbi'] }
        ]
      });
    }
    //
            //####################################################################
            // DO NOT DELETE THIS IT WILL BE NEEDED FOR THE UIKIT PAGE //
            //####################################################################
            //
    
            // {
            //     label: 'UI Components',
            //     items: [
            //         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
            //         { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
            //         { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
            //         { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
            //         { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
            //         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
            //         { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
            //         { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
            //         { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
            //         { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
            //         { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
            //         { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
            //         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
            //         { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
            //         { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
            //     ]
            // },
            // {
            //     label: 'Pages',
            //     icon: 'pi pi-fw pi-briefcase',
            //     routerLink: ['/pages'],
            //     items: [
            //         {
            //             label: 'Landing',
            //             icon: 'pi pi-fw pi-globe',
            //             routerLink: ['/landing']
            //         },
            //         {
            //             label: 'Auth',
            //             icon: 'pi pi-fw pi-user',
            //             items: [
            //                 {
            //                     label: 'Login',
            //                     icon: 'pi pi-fw pi-sign-in',
            //                     routerLink: ['/auth/login']
            //                 },
            //                 {
            //                     label: 'Error',
            //                     icon: 'pi pi-fw pi-times-circle',
            //                     routerLink: ['/auth/error']
            //                 },
            //                 {
            //                     label: 'Access Denied',
            //                     icon: 'pi pi-fw pi-lock',
            //                     routerLink: ['/auth/access']
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Crud',
            //             icon: 'pi pi-fw pi-pencil',
            //             routerLink: ['/pages/crud']
            //         },
            //         {
            //             label: 'Not Found',
            //             icon: 'pi pi-fw pi-exclamation-circle',
            //             routerLink: ['/pages/notfound']
            //         },
            //         {
            //             label: 'Empty',
            //             icon: 'pi pi-fw pi-circle-off',
            //             routerLink: ['/pages/empty']
            //         }
            //     ]
            // },
            // {
            //     label: 'Hierarchy',
            //     items: [
            //         {
            //             label: 'Submenu 1',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Submenu 2',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 2.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 2.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         }
            //     ]
            // },
            //

  }
}
