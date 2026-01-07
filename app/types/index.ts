export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  fakePrice?: number;
  imageUrl: string;
  images?: any[];
  categoryName?: string;
  quantity?: number;
  sales?: number;
  stockAdditions?: StockAddition[];
  remarks?: string;
  isDigital?: boolean;
  downloadLink?: string;
}

export interface StockAddition {
  quantityAdded: number;
  dateAdded: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}
