/**
 * Cart types for Grit & Grace storefront (localStorage cart)
 */

import type { ProductVariant } from "./product";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: ProductVariant | null;
  variants?: ProductVariant[];
}

export type Cart = CartItem[];
