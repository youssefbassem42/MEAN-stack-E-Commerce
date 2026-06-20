import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminStats, AdminOrder, InventoryLog } from '../../../core/services/admin.service';
import { ProductService, Category } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { Product } from '../../../core/models/product.model';
import { AuthUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  readonly stats = signal<AdminStats | null>(null);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly orders = signal<AdminOrder[]>([]);
  readonly users = signal<AuthUser[]>([]);
  readonly inventoryLogs = signal<InventoryLog[]>([]);

  readonly currentTab = signal<'stats' | 'products' | 'orders' | 'users' | 'inventory'>('stats');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly successMessage = signal<string>('');

  // Product Form State
  readonly editingProduct = signal<Product | null>(null);
  readonly showProductModal = signal<boolean>(false);
  
  readonly productForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    slug: new FormControl(''),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    description: new FormControl('', [Validators.required]),
    categoryId: new FormControl('', [Validators.required]),
    tagsString: new FormControl(''),
    imageString: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadStats();
    this.loadCategories();
  }

  setTab(tab: 'stats' | 'products' | 'orders' | 'users' | 'inventory'): void {
    this.currentTab.set(tab);
    this.error.set('');
    this.successMessage.set('');
    
    if (tab === 'stats') this.loadStats();
    else if (tab === 'products') this.loadProducts();
    else if (tab === 'orders') this.loadOrders();
    else if (tab === 'users') this.loadUsers();
    else if (tab === 'inventory') this.loadInventoryLogs();
  }

  loadStats(): void {
    this.loading.set(true);
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch statistics.');
        this.loading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.searchProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch products.');
        this.loading.set(false);
      }
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch orders.');
        this.loading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch users.');
        this.loading.set(false);
      }
    });
  }

  loadInventoryLogs(): void {
    this.loading.set(true);
    this.adminService.getInventoryLogs().subscribe({
      next: (data) => {
        this.inventoryLogs.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch inventory logs.');
        this.loading.set(false);
      }
    });
  }

  openAddProductModal(): void {
    this.editingProduct.set(null);
    this.productForm.reset();
    this.showProductModal.set(true);
  }

  openEditProductModal(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.setValue({
      title: product.title,
      slug: product.slug || '',
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId,
      tagsString: (product.tags || []).join(', '),
      imageString: (product.images || []).join(', '),
    });
    this.showProductModal.set(true);
  }

  closeProductModal(): void {
    this.showProductModal.set(false);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    const formVal = this.productForm.value;
    const tags = formVal.tagsString ? formVal.tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
    const images = formVal.imageString ? formVal.imageString.split(',').map(img => img.trim()).filter(Boolean) : [];

    const productPayload = {
      title: formVal.title!,
      slug: formVal.slug || undefined,
      price: formVal.price!,
      stock: formVal.stock!,
      description: formVal.description!,
      categoryId: formVal.categoryId!,
      tags,
      images: images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'],
    };

    const editProd = this.editingProduct();
    if (editProd) {
      this.productService.updateProduct(editProd._id, productPayload).subscribe({
        next: () => {
          this.successMessage.set('Product updated successfully!');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update product.');
          this.loading.set(false);
        }
      });
    } else {
      this.productService.createProduct(productPayload).subscribe({
        next: () => {
          this.successMessage.set('Product created successfully!');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create product.');
          this.loading.set(false);
        }
      });
    }
  }

  deleteProduct(productId: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.successMessage.set('Product deleted successfully!');
        this.loadProducts();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete product.');
        this.loading.set(false);
      }
    });
  }

  updateOrderStatus(orderId: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.successMessage.set('Order status updated successfully!');
        this.loadOrders();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update order status.');
        this.loading.set(false);
      }
    });
  }

  toggleUserRole(user: AuthUser): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change ${user.firstName}'s role to ${newRole}?`)) return;

    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.adminService.updateUserRole(user.id || (user as any)._id, newRole).subscribe({
      next: () => {
        this.successMessage.set(`User role updated to ${newRole}!`);
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update user role.');
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    }
  }

  getCategoryName(catId: string): string {
    const cat = this.categories().find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  }
}
