export interface Product {
  product_id: number;
  name: string;
  aliases?: string[];
  price: number;
  quantity: number;
  quantityType?: string;
  size?: string;
  weight?: string;
  appearanceStatus?: string;
  sizeType?: string;
  productType?: string;
  serializable?: boolean;
  isApproved: boolean;
  minquantity?: number;
  categories?: string[];
  description?: string;
  defineSerialLater?: boolean;
  warehouse_id: number;
  serialHeadings?: string[];
  hasReference?: boolean;
  referenceId?: number;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
  initialStockDate?: string;
  warehouse?: {
    name: string;
  };
  stock?: Stock[];
  brand?: string;
  brandLogo?: string;
  image?: string;
}

export interface Stock {
  storeId: number;
  storeName: string;
  quantity: number;
  pendingQuantity?: number;
  serialNumbers?: SerialNumber[];
  pendingSerialNumbers?: SerialNumber[];
}

export interface SerialNumber {
  value: string;
  additional?: AdditionalSerialNumber[];
}

export interface AdditionalSerialNumber {
  heading: string;
  value: string;
}

export interface PriceHistory {
  id: number;
  product_id: number;
  price: number;
  createdAt: string;
} 