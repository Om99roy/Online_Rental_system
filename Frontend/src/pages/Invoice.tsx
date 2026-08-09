import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { API } from "../lib/api";
import type { InvoiceData } from "../types/invoice";
import toast from "react-hot-toast";

export default function Invoice() {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await axios.get(API.INVOICES.GET(rentalId!), {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        setInvoice(res.data.data);
      } catch (e) {
        const message =
          e instanceof AxiosError
            ? (e.response?.data?.message ?? "Could not load invoice")
            : "Could not load invoice";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    if (rentalId) load();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">Loading invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">
          {error ?? "Invoice not found."}
        </p>
      </div>
    );
  }

  const customerName =
    [invoice.customer.firstName, invoice.customer.lastName]
      .filter(Boolean)
      .join(" ") || invoice.customer.username;

  const invoiceNumber =
    invoice.invoice?.invoiceNumber ?? `RNT-${invoice.rental.rentalNumber}`;
  const issuedAt = invoice.invoice?.issuedAt ?? invoice.rental.startDate;
  const currency = invoice.organization.currency ?? "INR";

  return (
    <div className="min-h-screen bg-background px-4 py-10 print:bg-white">
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-8 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            {invoice.organization.logoUrl && (
              <img
                src={invoice.organization.logoUrl}
                alt={invoice.organization.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-text">
                {invoice.organization.name}
              </p>
              {invoice.organization.address && (
                <p className="text-xs text-text-subtle">
                  {invoice.organization.address}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-primary hover:bg-secondary transition-colors text-white text-sm font-semibold rounded-lg px-4 py-2 print:hidden"
          >
            Print / Save PDF
          </button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold purple-fade-text">
              {invoiceNumber}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Issued {new Date(issuedAt).toLocaleDateString("en-IN")}
            </p>
            <p className="text-xs text-text-subtle mt-1">
              Rental {invoice.rental.rentalNumber}
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {invoice.rental.status}
          </span>
        </div>

        {/* Customer + rental period */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-text-subtle uppercase text-xs mb-1">Billed to</p>
            <p className="font-medium text-text">{customerName}</p>
            <p className="text-text-muted">{invoice.customer.email}</p>
            {invoice.customer.phone && (
              <p className="text-text-muted">{invoice.customer.phone}</p>
            )}
          </div>
          <div>
            <p className="text-text-subtle uppercase text-xs mb-1">
              Rental period
            </p>
            <p className="text-text-muted">
              {new Date(invoice.rental.startDate).toLocaleDateString("en-IN")} —{" "}
              {new Date(invoice.rental.endDate).toLocaleDateString("en-IN")}
            </p>
            {invoice.rental.actualReturnAt && (
              <p className="text-text-subtle text-xs mt-1">
                Returned{" "}
                {new Date(invoice.rental.actualReturnAt).toLocaleDateString(
                  "en-IN",
                )}
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-text-subtle uppercase text-xs border-b border-border">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2.5 text-text">{item.productName}</td>
                <td className="py-2.5 text-center text-text-muted">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right text-text-muted">
                  {currency} {item.pricePerUnit.toLocaleString("en-IN")}
                </td>
                <td className="py-2.5 text-right text-text">
                  {currency} {item.subtotal.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Damage reports, if any */}
        {invoice.damageReports.length > 0 && (
          <div className="mb-6 text-sm">
            <p className="text-text-subtle uppercase text-xs mb-2">
              Damage charges
            </p>
            {invoice.damageReports.map((report) => (
              <div
                key={report.id}
                className="flex justify-between text-text-muted py-1"
              >
                <span>
                  {report.productName} —{" "}
                  {report.type.replace("_", " ").toLowerCase()}
                  {report.resolved && (
                    <span className="text-primary ml-1">(resolved)</span>
                  )}
                </span>
                <span>
                  {currency} {report.repairCost.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-1.5 text-sm">
            <Row
              label="Subtotal"
              value={invoice.charges.subtotal}
              currency={currency}
            />
            {invoice.charges.discount > 0 && (
              <Row
                label="Discount"
                value={-invoice.charges.discount}
                currency={currency}
              />
            )}
            {invoice.charges.tax > 0 && (
              <Row
                label="Tax"
                value={invoice.charges.tax}
                currency={currency}
              />
            )}
            {invoice.charges.lateFee > 0 && (
              <Row
                label="Late fee"
                value={invoice.charges.lateFee}
                currency={currency}
              />
            )}
            {invoice.charges.damageCharges > 0 && (
              <Row
                label="Damage charges"
                value={invoice.charges.damageCharges}
                currency={currency}
              />
            )}
            <div className="border-t border-border pt-1.5 mt-1.5">
              <Row
                label="Total"
                value={invoice.charges.totalAmount}
                currency={currency}
                bold
              />
            </div>

            {invoice.securityDeposit && (
              <>
                <Row
                  label="Security deposit held"
                  value={invoice.securityDeposit.amount}
                  currency={currency}
                  muted
                />
                {invoice.securityDeposit.deductedAmount > 0 && (
                  <Row
                    label="Deposit deducted"
                    value={invoice.securityDeposit.deductedAmount}
                    currency={currency}
                    muted
                  />
                )}
                {invoice.securityDeposit.refundedAmount > 0 && (
                  <Row
                    label="Deposit refunded"
                    value={invoice.securityDeposit.refundedAmount}
                    currency={currency}
                    muted
                  />
                )}
              </>
            )}

            <Row
              label="Paid"
              value={invoice.payments.totalPaid}
              currency={currency}
              muted
            />
            <div className="border-t border-border pt-1.5 mt-1.5">
              <Row
                label="Balance due"
                value={invoice.payments.balanceDue}
                currency={currency}
                bold
              />
            </div>
          </div>
        </div>

        {/* Payment history */}
        {invoice.payments.transactions.length > 0 && (
          <div className="text-sm">
            <p className="text-text-subtle uppercase text-xs mb-2">
              Payment history
            </p>
            {invoice.payments.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between text-text-muted py-1"
              >
                <span>
                  {tx.method} · {tx.status}
                  {tx.paidAt &&
                    ` · ${new Date(tx.paidAt).toLocaleDateString("en-IN")}`}
                </span>
                <span>
                  {currency} {tx.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  currency,
  bold,
  muted,
}: {
  label: string;
  value: number;
  currency: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${bold ? "font-semibold text-text" : muted ? "text-text-subtle" : "text-text-muted"}`}
    >
      <span>{label}</span>
      <span>
        {currency} {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
