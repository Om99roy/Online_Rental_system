import type {
  PaymentOrder,
  PaymentResult,
  PaymentMethod,
} from "../../types/payment";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mirrors what your backend's `POST /payments/create-order` will return
// once wired to the real Razorpay Orders API.
export async function createPaymentOrder(
  amount: number,
  receipt: string,
): Promise<PaymentOrder> {
  await delay(300);
  return {
    orderId: `order_mock_${crypto.randomUUID().slice(0, 12)}`,
    amount,
    currency: "INR",
    receipt,
  };
}
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";
// In production this opens window.Razorpay({ ...options }).open() using
// the checkout.js script, and resolves/rejects based on the handler callback.
// Keeping the same function signature means Checkout.tsx doesn't change
// when this gets wired to the real SDK — only this file does.
export async function initiatePayment(
  order: PaymentOrder,
  method: PaymentMethod,
): Promise<PaymentResult> {
  await delay(1200); // simulate gateway round-trip

  // TODO(real integration):
  // const options = {
  //   key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //   amount: order.amount * 100, // paise
  //   currency: order.currency,
  //   order_id: order.orderId,
  //   handler: (response) => resolve({ success: true, paymentId: response.razorpay_payment_id, orderId: order.orderId, method }),
  //   modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
  // };
  // new window.Razorpay(options).open();

  return {
    success: true,
    paymentId: `pay_mock_${crypto.randomUUID().slice(0, 12)}`,
    orderId: order.orderId,
    method,
  };
}
