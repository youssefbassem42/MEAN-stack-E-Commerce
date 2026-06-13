import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { AuthService } from './auth.service';

export interface AddressDto {
  id: string;
  userId: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private get headers() {
    const token = localStorage.getItem('accessToken') ?? '';
    return { Authorization: `Bearer ${token}` };
  }

  getProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${apiConfig.baseUrl}/profile`, { headers: this.headers });
  }

  updateProfile(payload: { firstName?: string; lastName?: string }): Observable<ProfileDto> {
    return this.http.put<ProfileDto>(`${apiConfig.baseUrl}/profile`, payload, { headers: this.headers });
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${apiConfig.baseUrl}/profile/change-password`, payload, {
      headers: this.headers,
    });
  }

  getAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(`${apiConfig.baseUrl}/addresses`, { headers: this.headers });
  }

  createAddress(payload: {
    city: string;
    street: string;
    building: string;
    apartment: string;
    isDefault?: boolean;
  }): Observable<AddressDto> {
    return this.http.post<AddressDto>(`${apiConfig.baseUrl}/addresses`, payload, { headers: this.headers });
  }

  updateAddress(
    id: string,
    payload: { city?: string; street?: string; building?: string; apartment?: string; isDefault?: boolean },
  ): Observable<AddressDto> {
    return this.http.put<AddressDto>(`${apiConfig.baseUrl}/addresses/${id}`, payload, { headers: this.headers });
  }

  deleteAddress(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${apiConfig.baseUrl}/addresses/${id}`, { headers: this.headers });
  }
}
