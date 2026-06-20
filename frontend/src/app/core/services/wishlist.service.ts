import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

export interface Wishlist {
  _id: string;
  userId: string;
  products: Product[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly wishlist = signal<Wishlist | null>(null);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadWishlist().subscribe();
      } else {
        this.clearLocalWishlist();
      }
    });
  }

  loadWishlist(): Observable<Wishlist> {
    return this.http.get<Wishlist>('/wishlist').pipe(
      tap((w) => this.wishlist.set(w))
    );
  }

  addToWishlist(productId: string): Observable<Wishlist> {
    return this.http.post<Wishlist>('/wishlist', { productId }).pipe(
      tap((w) => this.wishlist.set(w))
    );
  }

  removeFromWishlist(productId: string): Observable<Wishlist> {
    return this.http.delete<Wishlist>(`/wishlist/${productId}`).pipe(
      tap((w) => this.wishlist.set(w))
    );
  }

  moveToCart(productId: string): Observable<Wishlist> {
    return this.http.post<Wishlist>('/wishlist/move-to-cart', { productId }).pipe(
      tap((w) => {
        this.wishlist.set(w);
        // Refresh cart to reflect new items added
        this.cartService.loadCart().subscribe();
      })
    );
  }

  moveAllToCart(): Observable<Wishlist> {
    return this.http.post<Wishlist>('/wishlist/move-all', {}).pipe(
      tap((w) => {
        this.wishlist.set(w);
        // Refresh cart to reflect all items added
        this.cartService.loadCart().subscribe();
      })
    );
  }

  hasProduct(productId: string): boolean {
    const w = this.wishlist();
    if (!w) return false;
    return w.products.some((p) => p._id === productId || p.id === productId);
  }

  clearLocalWishlist(): void {
    this.wishlist.set(null);
  }
}
