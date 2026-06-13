import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly http = inject(HttpClient);

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`/home/featured?limit=${limit}`);
  }

  getNewArrivals(limit = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`/home/new-arrivals?limit=${limit}`);
  }

  getBestSellers(limit = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`/home/best-sellers?limit=${limit}`);
  }

  getTrendingProducts(limit = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`/home/trending?limit=${limit}`);
  }
}
