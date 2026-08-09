import { useCartStore } from "../../store/CartStore.ts";
import type { Product } from "../../types/product.ts";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state)=>state.addItem);
  const outOfStock = product.status === "OUT_OF_STOCK" || product.stock === 0;

  function handleAddToCart() {
    addItem(product, 1, 1);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
      <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {outOfStock && (
          <span className="absolute top-2 right-2 bg-red-500/90 text-white text-xs font-semibold px-2 py-1 rounded-md">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-text-subtle uppercase tracking-wide mb-1">
          {product.category} · {product.brand}
        </p>
        <h3 className="font-semibold text-text mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary">
              ₹{product.pricePerDay}
            </span>
            <span className="text-xs text-text-muted">/day</span>
          </div>
          <span className="text-xs text-text-subtle">
            Deposit ₹{product.securityDeposit}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
