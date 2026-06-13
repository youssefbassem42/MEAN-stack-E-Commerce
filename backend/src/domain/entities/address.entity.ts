export interface AddressEntity {
  id: string;
  userId: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
