import type { CartItem } from "../../types/cart";
import type { Address } from "../../types/address";
import type { PaymentMethod } from "../../types/payment";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface PlaceOrderInput {
  items: CartItem[];
  pickupMethod: "DELIVERY" | "STORE_PICKUP";
  address: Address | null;
  paymentMethod: PaymentMethod;
  paymentId: string;
  subtotal: number;
  deposit: number;
  total: number;
}

export interface PlacedOrder extends PlaceOrderInput {
  rentalNumber: string;
  createdAt: string;
}

export async function placeOrderMock(
  input: PlaceOrderInput,
): Promise<PlacedOrder> {
  await delay(500);
  return {
    ...input,
    rentalNumber: `RNT-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
  };
}
