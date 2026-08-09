export type PickupMethod = "DELIVERY" | "STORE_PICKUP";

export interface CheckoutState {
  pickupMethod: PickupMethod;
  addressId: string | null;
}
