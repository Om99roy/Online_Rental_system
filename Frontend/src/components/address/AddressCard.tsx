import type { Address } from "../../types/address";

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function AddressCard({
  address,
  selected,
  onSelect,
  onRemove,
}: AddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative border rounded-xl p-4 cursor-pointer transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-text text-sm">
            {address.name}{" "}
            {address.isDefault && (
              <span className="text-xs text-primary ml-1">(Default)</span>
            )}
          </p>
          <p className="text-sm text-text-muted mt-1">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm text-text-muted">
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="text-xs text-text-subtle mt-1">{address.phone}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-text-subtle hover:text-red-400 transition-colors text-xs flex-shrink-0"
        >
          Remove
        </button>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-[10px]">✓</span>
        </div>
      )}
    </div>
  );
}
