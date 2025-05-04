import { Component } from '@angular/core';
import { OrderTable } from "../components/ordersTable";

@Component({
  selector: 'app-sales-orders',
  imports: [OrderTable],
  template: `
 <app-orders-table> </app-orders-table> `,
})
export class OrdersComponent {

}
