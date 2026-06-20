import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartService } from './cart.service';

export interface CheckoutResult {
  clientSecret: string;
  orderId: string;
  paymentIntentId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);

  checkout(): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>('/checkout', {}).pipe(
      tap(() => {
        // Refresh cart to show it is now empty after checkout
        this.cartService.loadCart().subscribe();
      })
    );
  }
}
