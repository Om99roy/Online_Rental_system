import { useState } from "react";

interface RazorpayModalProps {
  open: boolean;
  amount: number;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export default function RazorpayModal({
  open,
  amount,
  orderId,
  onSuccess,
  onCancel,
}: RazorpayModalProps) {
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  function handlePay() {
    setProcessing(true);
    // Simulates the gateway round-trip a real Razorpay modal would take
    setTimeout(() => {
      const paymentId = `pay_mock_${crypto.randomUUID().slice(0, 14)}`;
      setProcessing(false);
      onSuccess(paymentId);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-2xl">
        {/* Razorpay-style header */}
        <div className="bg-[#3395FF] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Razorpay
            </p>
            <p className="text-white/80 text-xs">Test Mode</p>
          </div>
          <button
            onClick={onCancel}
            disabled={processing}
            className="text-white/80 hover:text-white text-xl leading-none disabled:opacity-40"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-500 text-xs mb-1">Order ID</p>
          <p className="text-gray-800 text-sm font-mono mb-4">{orderId}</p>

          <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="text-gray-500 text-sm">Amount payable</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{amount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-2 mb-5">
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400">
              Card number · 4111 1111 1111 1111
            </div>
            <div className="flex gap-2">
              <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                MM / YY
              </div>
              <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                CVV
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-[#3395FF] hover:bg-[#2680e8] transition-colors text-white font-semibold rounded-lg py-3 text-sm disabled:opacity-60"
          >
            {processing
              ? "Processing payment..."
              : `Pay ₹${amount.toLocaleString("en-IN")}`}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            This is a test payment · No real money will be charged
          </p>
        </div>
      </div>
    </div>
  );
}
