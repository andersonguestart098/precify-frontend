export interface CompositionItem {
  id: string;
  materialCode: string;
  productId?: string | null;
  name: string;
  imageUrl?: string | null;
  supplier?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface Composition {
  id: string;
  name: string;
  items: CompositionItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompositionItemInput {
  materialCode: string;
  productId?: string | null;
  name: string;
  imageUrl?: string | null;
  supplier?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
}
