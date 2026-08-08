export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "UPI"
  | "BANK_TRANSFER"
  | "ONLINE";

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  method: PaymentMethod;
}
