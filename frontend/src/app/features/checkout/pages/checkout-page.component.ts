import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ProfileService, AddressDto } from '../../../core/services/profile.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly paymentService = inject(PaymentService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly addresses = signal<AddressDto[]>([]);
  readonly selectedAddressId = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly processingPayment = signal<boolean>(false);

  // New Address Form
  readonly addressForm = new FormGroup({
    city: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    building: new FormControl('', [Validators.required]),
    apartment: new FormControl('', [Validators.required]),
  });

  // Credit Card Form
  readonly cardForm = new FormGroup({
    cardNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{16}$/),
    ]),
    cardExpiry: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
    ]),
    cardCvv: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}$/),
    ]),
  });

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.profileService.getAddresses().subscribe({
      next: (addr) => {
        this.addresses.set(addr);
        const defaultAddr = addr.find((a) => a.isDefault);
        if (defaultAddr) {
          this.selectedAddressId.set(defaultAddr.id);
        } else if (addr.length > 0) {
          this.selectedAddressId.set(addr[0].id);
        }
      },
    });
  }

  selectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  isCardPayment(): boolean {
    return this.cartService.cart()?.shippingMethod === 'CARD';
  }

  onSubmit(): void {
    if (this.loading() || this.processingPayment()) return;

    this.error.set('');

    // 1. Validate Address
    let addressPayload: any = null;
    if (this.selectedAddressId() === 'new' || this.addresses().length === 0) {
      if (this.addressForm.invalid) {
        this.error.set('Please fill in a valid shipping address.');
        return;
      }
      addressPayload = this.addressForm.value;
    }

    // 2. Validate Card if applicable
    if (this.isCardPayment()) {
      if (this.cardForm.invalid) {
        this.error.set('Please provide valid credit card credentials.');
        return;
      }
    }

    this.loading.set(true);

    const proceedToCheckout = () => {
      this.processingPayment.set(true);
      this.paymentService.checkout().subscribe({
        next: (result) => {
          // Simulate Stripe processing delay
          setTimeout(() => {
            this.processingPayment.set(false);
            this.loading.set(false);
            this.router.navigate(['/checkout/success'], {
              queryParams: { orderId: result.orderId },
            });
          }, 2000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Checkout failed. Please try again.');
          this.processingPayment.set(false);
          this.loading.set(false);
        },
      });
    };

    // If new address, save it first
    if (addressPayload) {
      this.profileService.createAddress(addressPayload).subscribe({
        next: (newAddr) => {
          this.addresses.update((list) => [...list, newAddr]);
          this.selectedAddressId.set(newAddr.id);
          proceedToCheckout();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to save address.');
          this.loading.set(false);
        },
      });
    } else {
      proceedToCheckout();
    }
  }
}
