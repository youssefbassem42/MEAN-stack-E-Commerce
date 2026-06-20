import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { Product } from '../models/product.model';

export interface OrderItem {
  productId: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  shippingMethod?: 'COD' | 'CARD';
  shipping?: number;
  subtotal?: number;
  vat?: number;
  grandTotal?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private get headers() {
    const token = localStorage.getItem('accessToken') ?? '';
    return { Authorization: `Bearer ${token}` };
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${apiConfig.baseUrl}/orders`, { headers: this.headers });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${apiConfig.baseUrl}/orders/${id}`, { headers: this.headers });
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(
      `${apiConfig.baseUrl}/orders/${id}/status`,
      { status },
      { headers: this.headers }
    );
  }
}
