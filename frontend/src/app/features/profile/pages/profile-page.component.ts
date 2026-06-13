import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService, AddressDto, ProfileDto } from '../../../core/services/profile.service';

type Section = 'info' | 'password' | 'addresses';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  readonly authService = inject(AuthService);

  readonly activeSection = signal<Section>('info');

  readonly profile = signal<ProfileDto | null>(null);
  readonly addresses = signal<AddressDto[]>([]);

  readonly profileLoading = signal(false);
  readonly profileError = signal('');
  readonly profileSuccess = signal('');

  readonly passwordLoading = signal(false);
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');

  readonly addressLoading = signal(false);
  readonly addressError = signal('');
  readonly addressSuccess = signal('');

  readonly showAddressForm = signal(false);
  readonly editingAddress = signal<AddressDto | null>(null);

  readonly infoForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly addressForm = this.fb.nonNullable.group({
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
    apartment: ['', Validators.required],
    isDefault: [false],
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddresses();
  }

  setSection(section: Section): void {
    this.activeSection.set(section);
    this.clearMessages();
  }

  private clearMessages(): void {
    this.profileError.set('');
    this.profileSuccess.set('');
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.addressError.set('');
    this.addressSuccess.set('');
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.infoForm.patchValue({ firstName: p.firstName, lastName: p.lastName });
      },
      error: () => this.profileError.set('Failed to load profile.'),
    });
  }

  private loadAddresses(): void {
    this.profileService.getAddresses().subscribe({
      next: (list) => this.addresses.set(list),
      error: () => {},
    });
  }

  onSaveInfo(): void {
    this.profileError.set('');
    this.profileSuccess.set('');
    if (this.infoForm.invalid) { this.infoForm.markAllAsTouched(); return; }
    this.profileLoading.set(true);
    this.profileService.updateProfile(this.infoForm.getRawValue()).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.profileLoading.set(false);
        this.profileSuccess.set('Profile updated.');
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(err?.error?.message ?? 'Update failed.');
      },
    });
  }

  onChangePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.passwordLoading.set(true);
    this.profileService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: (res) => {
        this.passwordLoading.set(false);
        this.passwordSuccess.set(res.message);
        this.passwordForm.reset();
        setTimeout(() => this.authService.clearSession(), 2000);
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err?.error?.message ?? 'Password change failed.');
      },
    });
  }

  openAddressForm(address: AddressDto | null = null): void {
    this.editingAddress.set(address);
    this.addressForm.reset();
    if (address) {
      this.addressForm.patchValue({
        city: address.city,
        street: address.street,
        building: address.building,
        apartment: address.apartment,
        isDefault: address.isDefault,
      });
    }
    this.showAddressForm.set(true);
  }

  closeAddressForm(): void {
    this.showAddressForm.set(false);
    this.editingAddress.set(null);
    this.addressForm.reset();
  }

  onSaveAddress(): void {
    this.addressError.set('');
    this.addressSuccess.set('');
    if (this.addressForm.invalid) { this.addressForm.markAllAsTouched(); return; }
    this.addressLoading.set(true);
    const payload = this.addressForm.getRawValue();
    const editing = this.editingAddress();

    const request$ = editing
      ? this.profileService.updateAddress(editing.id, payload)
      : this.profileService.createAddress(payload);

    request$.subscribe({
      next: () => {
        this.addressLoading.set(false);
        this.addressSuccess.set(editing ? 'Address updated.' : 'Address added.');
        this.closeAddressForm();
        this.loadAddresses();
      },
      error: (err) => {
        this.addressLoading.set(false);
        this.addressError.set(err?.error?.message ?? 'Failed to save address.');
      },
    });
  }

  onDeleteAddress(id: string): void {
    this.addressLoading.set(true);
    this.profileService.deleteAddress(id).subscribe({
      next: () => {
        this.addressLoading.set(false);
        this.loadAddresses();
      },
      error: (err) => {
        this.addressLoading.set(false);
        this.addressError.set(err?.error?.message ?? 'Delete failed.');
      },
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({ error: () => this.authService.clearSession() });
  }
}
