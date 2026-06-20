import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist-page.component.html',
  styleUrl: './wishlist-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPageComponent {
  protected readonly wishlistService = inject(WishlistService);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  get products() {
    return this.wishlistService.wishlist()?.products || [];
  }

  removeFromWishlist(productId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to remove from wishlist.');
        this.loading.set(false);
      },
    });
  }

  moveToCart(productId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.wishlistService.moveToCart(productId).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to move item to cart.');
        this.loading.set(false);
      },
    });
  }

  moveAllToCart(): void {
    this.loading.set(true);
    this.error.set('');
    this.wishlistService.moveAllToCart().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to move all items to cart.');
        this.loading.set(false);
      },
    });
  }
}
