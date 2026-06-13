import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/home.service';
import { Product } from '../../../core/models/product.model';

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly homeService = inject(HomeService);

  // Hero Carousel State
  readonly currentSlide = signal(0);
  private carouselInterval: any;

  readonly slides: HeroSlide[] = [
    {
      title: 'Minimalist Design. Maximum Impact.',
      subtitle: 'EXCLUSIVE COLLECTION',
      description: 'Discover curated essential products designed to fit your clean, modern lifestyle. Built for durability, beauty, and absolute precision.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop New Arrivals',
      ctaLink: '/products',
      badge: 'Trending Now'
    },
    {
      title: 'Glassmorphic Beauty, Smart Tech.',
      subtitle: 'MODERN TECH',
      description: 'Upgrade your productivity and elevate your space with state-of-the-art consumer accessories that represent the pinnacle of functionality and premium aesthetics.',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Explore Gear',
      ctaLink: '/products',
      badge: 'Limited Supply'
    },
    {
      title: 'Crafted For the Discerning Eye.',
      subtitle: 'BEST SELLING LIFESTYLE',
      description: 'Join thousands of collectors worldwide who trust our dedication to premium craftsmanship, fast delivery, and world-class customer service.',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'View Collections',
      ctaLink: '/products',
      badge: 'Hot Seller'
    }
  ];

  // Product Lists Signals
  readonly featuredProducts = signal<Product[]>([]);
  readonly newArrivals = signal<Product[]>([]);
  readonly trendingProducts = signal<Product[]>([]);
  readonly bestSellers = signal<Product[]>([]);

  // Loading States
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.startCarousel();
    this.loadAllProducts();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  private startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.currentSlide.update((prev) => (prev + 1) % this.slides.length);
    }, 6000);
  }

  private stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  setSlide(index: number): void {
    this.currentSlide.set(index);
    this.stopCarousel();
    this.startCarousel();
  }

  nextSlide(): void {
    this.currentSlide.update((prev) => (prev + 1) % this.slides.length);
    this.stopCarousel();
    this.startCarousel();
  }

  prevSlide(): void {
    this.currentSlide.update((prev) => (prev - 1 + this.slides.length) % this.slides.length);
    this.stopCarousel();
    this.startCarousel();
  }

  private loadAllProducts(): void {
    this.loading.set(true);
    this.error.set('');

    // Fetch all home lists in parallel
    const subscription = Promise.all([
      this.homeService.getFeaturedProducts(4).toPromise().catch(() => []),
      this.homeService.getNewArrivals(4).toPromise().catch(() => []),
      this.homeService.getTrendingProducts(4).toPromise().catch(() => []),
      this.homeService.getBestSellers(4).toPromise().catch(() => [])
    ]).then(([featured, newArrivals, trending, best]) => {
      this.featuredProducts.set(featured || []);
      this.newArrivals.set(newArrivals || []);
      this.trendingProducts.set(trending || []);
      this.bestSellers.set(best || []);
      this.loading.set(false);
    }).catch((err) => {
      this.loading.set(false);
      this.error.set('Could not load homepage products. Please try again later.');
    });
  }
}
