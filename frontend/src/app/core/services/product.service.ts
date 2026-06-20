import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/categories');
  }

  searchProducts(params: SearchParams): Observable<SearchResult> {
    let httpParams = new HttpParams();

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.minPrice !== undefined && params.minPrice !== null) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<SearchResult>('/products/search', { params: httpParams });
  }

  getProduct(idOrSlug: string): Observable<Product & { views: number }> {
    return this.http.get<Product & { views: number }>(`/products/${idOrSlug}`);
  }

  getReviews(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`/reviews/${productId}`);
  }

  createReview(review: { productId: string; rating: number; comment: string }): Observable<any> {
    return this.http.post<any>('/reviews', review);
  }

  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>('/products', product);
  }

  updateProduct(id: string, product: any): Observable<Product> {
    return this.http.put<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`/products/${id}`);
  }
}
