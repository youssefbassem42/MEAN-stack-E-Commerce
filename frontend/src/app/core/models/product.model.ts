export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  categoryId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
