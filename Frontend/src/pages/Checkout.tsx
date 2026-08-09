import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/CartStore";
import { useAddressStore } from "../store/AddressStore";
import AddressCard from "../components/address/AddressCard";
import AddressForm from "../components/address/AddressForm";
import type { PickupMethod } from "../types/checkout.ts";
import type { PaymentMethod } from "../types/payment.ts";
import { createPaymentOrder } from "../lib/payment/razorpayGateway";
import { placeOrderMock } from "../lib/mock/order.api";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/AuthContext.tsx";
import { useRentalDashboardStore } from "../store/RentalDashboard.ts";
import RazorpayModal from "../components/payment/RazorpayModal";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "ONLINE", label: "Online (Razorpay)" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash at store" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalDeposit = useCartStore((state) => state.totalDeposit());
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const addresses = useAddressStore((state) => state.addresses);
  const addressesLoading = useAddressStore((state) => state.loading);
  const loadAddresses = useAddressStore((state) => state.loadAddresses);
  const addAddress = useAddressStore((state) => state.addAddress);
  const removeAddress = useAddressStore((state) => state.removeAddress);
  const addRental = useRentalDashboardStore((state) => state.addRental);

  const [pickupMethod, setPickupMethod] =
    useState<PickupMethod>("STORE_PICKUP");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE");
  const [placing, setPlacing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const grandTotal = subtotal + totalDeposit;
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

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

  async function handlePlaceOrder() {
    if (!user) {
      toast.error("Please log in to complete checkout");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (pickupMethod === "DELIVERY" && !selectedAddress) {
      toast.error("Select a delivery address first");
      return;
    }

    // Cash at store skips the payment gateway entirely — matches real
    // Razorpay behavior (you don't open a card modal for cash orders).
    if (paymentMethod === "CASH") {
      setPlacing(true);
      await finalizeOrder("cash_on_pickup");
      return;
    }

    setPlacing(true);
    try {
      const order = await createPaymentOrder(
        grandTotal,
        `checkout_${Date.now()}`,
      );
      setPaymentOrder(order);
      setShowPaymentModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not start payment. Please try again.");
      setPlacing(false);
    }
  }

  async function finalizeOrder(paymentId: string) {
    try {
      const placed = await placeOrderMock({
        items,
        pickupMethod,
        address: pickupMethod === "DELIVERY" ? selectedAddress : null,
        paymentMethod,
        paymentId,
        subtotal,
        deposit: totalDeposit,
        total: grandTotal,
      });

      addRental({
        id: placed.rentalNumber,
        rentalNumber: placed.rentalNumber,
        customerName: user
          ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
            user.username
          : "Guest",
        customerEmail: user?.email ?? "unknown@example.com",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(
          Date.now() + Math.max(...items.map((i) => i.rentalDays)) * 86400000,
        )
          .toISOString()
          .slice(0, 10),
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        totalAmount: grandTotal,
        status: "CONFIRMED",
      });

      clearCart();
      toast.success("Order placed successfully");
      navigate("/order-confirmation", { state: { order: placed } });
    } catch (err) {
      console.error(err);
      toast.error("Could not place order. Please try again.");
    } finally {
      setPlacing(false);
      setShowPaymentModal(false);
    }
  }

  async function handleAddAddress(data: Parameters<typeof addAddress>[0]) {
    const newAddr = await addAddress(data);
    if (newAddr) {
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
    }
  }

  async function handleRemoveAddress(id: string) {
    await removeAddress(id);
    if (selectedAddressId === id) setSelectedAddressId(null);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold purple-fade-text mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pickup method */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Delivery method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPickupMethod("STORE_PICKUP")}
                  className={`border rounded-xl p-4 text-left transition-colors ${
                    pickupMethod === "STORE_PICKUP"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm">Store pickup</p>
                  <p className="text-xs text-text-muted mt-1">
                    Collect from our location
                  </p>
                </button>
                <button
                  onClick={() => setPickupMethod("DELIVERY")}
                  className={`border rounded-xl p-4 text-left transition-colors ${
                    pickupMethod === "DELIVERY"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-sm">Delivery</p>
                  <p className="text-xs text-text-muted mt-1">
                    We'll ship it to you
                  </p>
                </button>
              </div>
            </div>

            {/* Address (only if delivery) */}
            {pickupMethod === "DELIVERY" && (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Delivery address</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-sm text-primary hover:text-secondary transition-colors"
                    >
                      + Add new
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <AddressForm
                    onCancel={() => setShowAddressForm(false)}
                    onSubmit={handleAddAddress}
                  />
                ) : addressesLoading ? (
                  <p className="text-sm text-text-muted">
                    Loading addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No saved addresses yet. Add one to continue.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        selected={address.id === selectedAddressId}
                        onSelect={() => setSelectedAddressId(address.id)}
                        onRemove={() => handleRemoveAddress(address.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment method */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Payment method</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`border rounded-xl p-3 text-sm font-medium transition-colors ${
                      paymentMethod === m.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-text-muted hover:border-primary/40"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-surface border border-border rounded-2xl p-5 h-fit">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-text-muted"
                >
                  <span className="truncate pr-2">
                    {item.product.name} × {item.quantity} ({item.rentalDays}d)
                  </span>
                  <span className="flex-shrink-0">
                    ₹
                    {(
                      item.product.pricePerDay *
                      item.quantity *
                      item.rentalDays
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Security deposit</span>
                <span>₹{totalDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-text">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-primary hover:bg-secondary transition-colors text-white font-semibold rounded-lg py-2.5 mt-5 disabled:opacity-50"
            >
              {placing
                ? "Processing..."
                : paymentMethod === "CASH"
                  ? "Place Order (Pay at Store)"
                  : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
            </button>
          </div>
        </div>
      </div>

      {paymentOrder && (
        <RazorpayModal
          open={showPaymentModal}
          amount={paymentOrder.amount}
          orderId={paymentOrder.orderId}
          onSuccess={(paymentId) => finalizeOrder(paymentId)}
          onCancel={() => {
            setShowPaymentModal(false);
            setPlacing(false);
            toast.error("Payment cancelled");
          }}
        />
      )}
    </div>
  );
}
