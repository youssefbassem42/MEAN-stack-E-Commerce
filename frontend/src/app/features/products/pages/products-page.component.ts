import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService, Category, SearchParams } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Search Control
  readonly searchControl = new FormControl('');

  // Signals for state management
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  // Pagination & Counts
  readonly totalProducts = signal(0);
  readonly page = signal(1);
  readonly limit = signal(12);

  // Active filters
  readonly selectedCategory = signal<string>('');
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly sort = signal<string>('newest');

  // Temporary price inputs for the filter form
  readonly minPriceInput = new FormControl<number | null>(null);
  readonly maxPriceInput = new FormControl<number | null>(null);

  private searchSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor() {
    // Re-run search whenever core signals change
    effect(() => {
      this.fetchProducts();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupDebouncedSearch();
    this.parseQueryParams();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  private setupDebouncedSearch(): void {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.updateQueryParams({ q: query || undefined, page: '1' });
      });
  }

  private parseQueryParams(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      // Set values from route params
      const q = params['q'] || '';
      if (this.searchControl.value !== q) {
        this.searchControl.setValue(q, { emitEvent: false });
      }

      this.selectedCategory.set(params['category'] || '');
      this.sort.set(params['sort'] || 'newest');
      this.page.set(params['page'] ? parseInt(params['page'], 10) : 1);

      const minP = params['minPrice'] ? parseFloat(params['minPrice']) : null;
      const maxP = params['maxPrice'] ? parseFloat(params['maxPrice']) : null;
      this.minPrice.set(minP);
      this.maxPrice.set(maxP);

      this.minPriceInput.setValue(minP, { emitEvent: false });
      this.maxPriceInput.setValue(maxP, { emitEvent: false });
    });
  }

  private updateQueryParams(params: Record<string, string | number | null | undefined>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.error.set('Failed to load categories.'),
    });
  }

  fetchProducts(): void {
    this.loading.set(true);

    const params: SearchParams = {
      q: this.searchControl.value || undefined,
      category: this.selectedCategory() || undefined,
      minPrice: this.minPrice() !== null ? this.minPrice()! : undefined,
      maxPrice: this.maxPrice() !== null ? this.maxPrice()! : undefined,
      sort: this.sort(),
      page: this.page(),
      limit: this.limit(),
    };

    this.productService.searchProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.totalProducts.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.error.set('Failed to search products.');
        this.loading.set(false);
      },
    });
  }

  // Action Triggers
  onCategorySelect(categorySlug: string): void {
    this.updateQueryParams({ category: categorySlug || undefined, page: 1 });
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateQueryParams({ sort: target.value, page: 1 });
  }

  applyPriceFilter(): void {
    this.updateQueryParams({
      minPrice: this.minPriceInput.value ?? undefined,
      maxPrice: this.maxPriceInput.value ?? undefined,
      page: 1,
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.minPriceInput.setValue(null);
    this.maxPriceInput.setValue(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  goToPage(pageNum: number): void {
    if (pageNum < 1 || pageNum > this.totalPages()) return;
    this.updateQueryParams({ page: pageNum });
  }

  totalPages(): number {
    return Math.ceil(this.totalProducts() / this.limit());
  }

  getPagesArray(): number[] {
    const total = this.totalPages();
    const arr: number[] = [];
    for (let i = 1; i <= total; i++) arr.push(i);
    return arr;
  }
}
