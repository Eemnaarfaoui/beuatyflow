import { Component } from '@angular/core';
import { InventoryTable } from '../components/inventoryTable';

@Component({
selector: 'app-inventory',
imports: [InventoryTable],
   template: `
  <app-inventory-table> </app-inventory-table> `

})
export class InventoryComponent {

}
