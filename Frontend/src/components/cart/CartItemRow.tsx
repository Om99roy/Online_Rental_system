import type { CartItem } from "../../types/cart";
import { useCartStore } from "../../store/CartStore";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateRentalDays = useCartStore((state) => state.updateRentalDays);
  const removeItem = useCartStore((state) => state.removeItem);

  const lineTotal = item.product.pricePerDay * item.quantity * item.rentalDays;

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-b-0">
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="w-20 h-20 rounded-lg object-cover bg-surface-2 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-text truncate">
              {item.product.name}
            </h4>
            <p className="text-xs text-text-subtle">
              ₹{item.product.pricePerDay}/day · Deposit ₹
              {item.product.securityDeposit}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            className="text-text-subtle hover:text-red-400 transition-colors text-sm flex-shrink-0"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>

        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted">Qty</label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="px-2.5 py-1 text-text-muted hover:bg-surface-2 transition-colors"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                disabled={item.quantity >= item.product.stock}
                className="px-2.5 py-1 text-text-muted hover:bg-surface-2 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted">Days</label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  updateRentalDays(item.product.id, item.rentalDays - 1)
                }
                className="px-2.5 py-1 text-text-muted hover:bg-surface-2 transition-colors"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                {item.rentalDays}
              </span>
              <button
                onClick={() =>
                  updateRentalDays(item.product.id, item.rentalDays + 1)
                }
                className="px-2.5 py-1 text-text-muted hover:bg-surface-2 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-text">
          ₹{lineTotal.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
