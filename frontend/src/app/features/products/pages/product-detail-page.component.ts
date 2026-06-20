import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signals
  readonly product = signal<(Product & { views?: number }) | null>(null);
  readonly reviews = signal<any[]>([]);
  readonly activeViewers = signal<number>(1);
  readonly loading = signal(true);
  readonly error = signal('');

  // Review Form state
  readonly submittingReview = signal(false);
  readonly reviewError = signal('');
  readonly reviewSuccess = signal('');
  readonly rating = signal<number>(5);
  readonly commentControl = new FormControl('', [Validators.required, Validators.minLength(2)]);

  // Interactive controls
  readonly quantity = signal<number>(1);
  readonly wishlisted = signal<boolean>(false);
  readonly activeImageIndex = signal<number>(0);

  private socket?: Socket;
  private routeSub?: Subscription;

  // Computed average rating
  get averageRating(): number {
    const list = this.reviews();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / list.length).toFixed(1));
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const idOrSlug = params.get('id');
      if (idOrSlug) {
        this.fetchProductAndReviews(idOrSlug);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.socket) {
      const currentProduct = this.product();
      if (currentProduct) {
        this.socket.emit('leave-product', currentProduct.id);
      }
      this.socket.disconnect();
    }
  }

  private fetchProductAndReviews(idOrSlug: string): void {
    this.loading.set(true);
    this.error.set('');

    this.productService.getProduct(idOrSlug).subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.activeImageIndex.set(0);
        this.setupSocketConnection(prod.id);
        this.wishlisted.set(this.wishlistService.hasProduct(prod.id));
        
        // Fetch reviews
        this.productService.getReviews(prod.id).subscribe({
          next: (revs) => {
            this.reviews.set(revs);
            this.loading.set(false);
          },
          error: () => {
            this.reviews.set([]);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('Product not found.');
        this.loading.set(false);
      },
    });
  }

  private setupSocketConnection(productId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(environment.apiBaseUrl, { forceNew: true });

    this.socket.on('connect', () => {
      this.socket?.emit('join-product', productId);
    });

    this.socket.on('viewer-count-changed', (data: { productId: string; count: number }) => {
      if (data.productId === productId) {
        this.activeViewers.set(data.count);
      }
    });
  }

  // Interactive Actions
  setRating(value: number): void {
    this.rating.set(value);
  }

  incrementQuantity(): void {
    const prod = this.product();
    if (prod && this.quantity() < prod.stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  toggleWishlist(): void {
    const prod = this.product();
    if (!prod) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.wishlisted()) {
      this.wishlistService.removeFromWishlist(prod.id).subscribe({
        next: () => this.wishlisted.set(false),
        error: (err) => alert(err.error?.message || 'Failed to remove from wishlist.'),
      });
    } else {
      this.wishlistService.addToWishlist(prod.id).subscribe({
        next: () => this.wishlisted.set(true),
        error: (err) => alert(err.error?.message || 'Failed to add to wishlist.'),
      });
    }
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  submitReview(): void {
    if (this.commentControl.invalid) {
      this.reviewError.set('Please provide a valid comment.');
      return;
    }

    const prod = this.product();
    if (!prod) return;

    this.submittingReview.set(true);
    this.reviewError.set('');
    this.reviewSuccess.set('');

    this.productService
      .createReview({
        productId: prod.id,
        rating: this.rating(),
        comment: this.commentControl.value || '',
      })
      .subscribe({
        next: (newReview) => {
          // Mock populated user info for frontend immediate update
          const currentUser = this.authService.user();
          const reviewWithUser = {
            ...newReview,
            userId: {
              firstName: currentUser?.firstName || 'Me',
              lastName: currentUser?.lastName || '',
              email: currentUser?.email || '',
            },
          };

          this.reviews.update((revs) => [reviewWithUser, ...revs]);
          this.commentControl.reset();
          this.rating.set(5);
          this.reviewSuccess.set('Review submitted successfully!');
          this.submittingReview.set(false);
        },
        error: (err) => {
          const msg = err.error?.message || 'Failed to submit review. Only verified buyers can review.';
          this.reviewError.set(msg);
          this.submittingReview.set(false);
        },
      });
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addItem(prod.id, this.quantity()).subscribe({
      next: () => {
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to add item to cart.');
      },
    });
  }
}
