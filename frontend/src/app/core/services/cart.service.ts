import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

export interface CartItem {
  productId: Product;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  shippingMethod: 'COD' | 'CARD';
  subtotal: number;
  vat: number;
  shipping: number;
  grandTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() => {
    const currentCart = this.cart();
    if (!currentCart) return 0;
    return currentCart.items.reduce((acc, item) => acc + item.quantity, 0);
  });

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.loadCart().subscribe();
      } else {
        this.clearLocalCart();
      }
    });
  }

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>('/cart').pipe(
      tap((c) => this.cart.set(c))
    );
  }

  addItem(productId: string, quantity = 1): Observable<Cart> {
    return this.http.post<Cart>('/cart/items', { productId, quantity }).pipe(
      tap((c) => this.cart.set(c))
    );
  }

  updateQuantity(productId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`/cart/items/${productId}`, { quantity }).pipe(
      tap((c) => this.cart.set(c))
    );
  }

  removeItem(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`/cart/items/${productId}`).pipe(
      tap((c) => this.cart.set(c))
    );
  }

  updateShipping(shippingMethod: 'COD' | 'CARD'): Observable<Cart> {
    return this.http.put<Cart>('/cart/shipping', { shippingMethod }).pipe(
      tap((c) => this.cart.set(c))
    );
  }

  clearLocalCart(): void {
    this.cart.set(null);
  }
}
