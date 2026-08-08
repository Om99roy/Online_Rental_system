import { useCartStore } from "../store/CartStore";
import CartItemRow from "../components/cart/CartItemRow";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalDeposit = useCartStore((state) => state.totalDeposit());
  const clearCart = useCartStore((state) => state.clearCart);

  const grandTotal = subtotal + totalDeposit;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-muted mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg px-6 py-2.5"
          >
            Browse products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold purple-fade-text">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-text-subtle hover:text-red-400 transition-colors"
          >
            Clear cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 h-fit">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Rental subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Security deposit</span>
                <span>₹{totalDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-text">
                <span>Total due at checkout</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 mt-5"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
