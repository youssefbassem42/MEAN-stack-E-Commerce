import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../../core/services/order.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set('');
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch orders.');
        this.loading.set(false);
      },
    });
  }

  calculateOrderTotal(order: Order): number {
    if (order.grandTotal !== undefined && order.grandTotal !== null) {
      return order.grandTotal;
    }
    let subtotal = order.items.reduce((acc, item) => {
      const price = item.productId ? item.productId.price : 0;
      return acc + price * item.quantity;
    }, 0);
    const vat = subtotal * 0.15;
    return subtotal + vat;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'packed':
        return 'bg-purple-50 text-purple-700 border-purple-250 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-250 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
      case 'cancelled':
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      default: // pending
        return 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    }
  }
}
