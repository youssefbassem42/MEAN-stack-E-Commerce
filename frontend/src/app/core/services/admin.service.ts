import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { AuthUser } from './auth.service';

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  lowStock: number;
}

export interface AdminOrder {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  items: Array<{
    productId: {
      _id: string;
      title: string;
      price: number;
      stock: number;
    } | null;
    quantity: number;
  }>;
  shippingMethod: string;
  shipping: number;
  subtotal: number;
  vat: number;
  grandTotal: number;
  status: string;
  createdAt: string;
}

export interface InventoryLog {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    stock: number;
  } | null;
  quantity: number;
  type: 'purchase' | 'cancel' | 'restock' | 'adjustment';
  referenceId?: {
    _id: string;
    grandTotal: number;
    status: string;
  } | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${apiConfig.baseUrl}/admin/stats`);
  }

  getUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(`${apiConfig.baseUrl}/admin/users`);
  }

  updateUserRole(userId: string, role: 'user' | 'admin'): Observable<AuthUser> {
    return this.http.put<AuthUser>(`${apiConfig.baseUrl}/admin/users/${userId}/role`, { role });
  }

  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${apiConfig.baseUrl}/admin/orders`);
  }

  getInventoryLogs(): Observable<InventoryLog[]> {
    return this.http.get<InventoryLog[]>(`${apiConfig.baseUrl}/admin/inventory-logs`);
  }
}
