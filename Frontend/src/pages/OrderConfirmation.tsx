import { useLocation, useNavigate } from "react-router-dom";
import type { PlacedOrder } from "../lib/mock/order.api";
import { useEffect } from "react";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as { order?: PlacedOrder } | null)?.order;

  useEffect(() => {
    if (!order) navigate("/products", { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold mb-1">Order confirmed</h1>
        <p className="text-text-muted text-sm mb-6">
          Rental{" "}
          <span className="text-text font-medium">{order.rentalNumber}</span>{" "}
          has been placed
        </p>

        <div className="bg-surface-2 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-text-muted">Items</span>
            <span>{order.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Method</span>
            <span>
              {order.pickupMethod === "DELIVERY" ? "Delivery" : "Store pickup"}
            </span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
            <span>Total paid</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/rentals")}
          className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
