import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, Cart } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  protected readonly cartService = inject(CartService);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  get cart(): Cart | null {
    return this.cartService.cart();
  }

  incrementQuantity(productId: string, currentQty: number, stock: number): void {
    if (currentQty >= stock) return;
    this.updateQty(productId, currentQty + 1);
  }

  decrementQuantity(productId: string, currentQty: number): void {
    if (currentQty <= 1) return;
    this.updateQty(productId, currentQty - 1);
  }

  updateQty(productId: string, quantity: number): void {
    this.loading.set(true);
    this.error.set('');
    this.cartService.updateQuantity(productId, quantity).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update quantity.');
        this.loading.set(false);
      },
    });
  }

  removeItem(productId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.cartService.removeItem(productId).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to remove item.');
        this.loading.set(false);
      },
    });
  }

  setShippingMethod(method: 'COD' | 'CARD'): void {
    this.loading.set(true);
    this.error.set('');
    this.cartService.updateShipping(method).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update shipping method.');
        this.loading.set(false);
      },
    });
  }
}
