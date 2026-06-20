import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Order } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal<boolean>(false);
  readonly updatingStatus = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly statusOptions = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch order details.');
        this.loading.set(false);
      },
    });
  }

  changeStatus(newStatus: string): void {
    const currentOrder = this.order();
    if (!currentOrder || this.updatingStatus()) return;

    this.updatingStatus.set(true);
    this.error.set('');

    this.orderService.updateOrderStatus(currentOrder._id, newStatus).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.updatingStatus.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update order status.');
        this.updatingStatus.set(false);
      },
    });
  }

  calculateSubtotal(order: Order): number {
    if (order.subtotal) {
      return order.subtotal;
    }
    return order.items.reduce((acc, item) => {
      const price = item.productId ? item.productId.price : 0;
      return acc + price * item.quantity;
    }, 0);
  }

  calculateVat(order: Order): number {
    if (order.vat) {
      return order.vat;
    }
    return this.calculateSubtotal(order) * 0.15;
  }

  calculateTotal(order: Order): number {
    if (order.grandTotal) {
      return order.grandTotal;
    }
    const shipping = order.shipping || (order.shippingMethod === 'COD' ? 50 : 0);
    return this.calculateSubtotal(order) + this.calculateVat(order) + shipping;
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

  // Helper to show visual step-by-step progress
  getStepIndex(status: string): number {
    const steps = ['pending', 'paid', 'packed', 'shipped', 'delivered'];
    return steps.indexOf(status);
  }
}
