import { Eye } from "lucide-react";
import RentalStatusBadge from "./RentalStatusBadge";

export interface RentalTableItem {
  id: string;
  rentalNumber: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  itemCount: number;
  totalAmount: number;
  status: string;
}

interface RentalTableProps {
  rentals: RentalTableItem[];
  onView: (id: string) => void;
}

const RentalTable = ({
  rentals,
  onView,
}: RentalTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-subtle">
            <th className="px-5 py-4">Rental</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4">Period</th>
            <th className="px-5 py-4">Items</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rentals.map((rental) => (
            <tr
              key={rental.id}
              className="border-b border-border last:border-0 transition hover:bg-surface-2/50"
            >
              <td className="px-5 py-4 font-medium">
                {rental.rentalNumber}
              </td>

              <td className="px-5 py-4">
                <div>
                  <p className="font-medium">
                    {rental.customerName}
                  </p>

                  <p className="text-xs text-text-muted">
                    {rental.customerEmail}
                  </p>
                </div>
              </td>

              <td className="px-5 py-4 text-sm">
                {formatDate(rental.startDate)}
                <span className="mx-1 text-text-subtle">
                  →
                </span>
                {formatDate(rental.endDate)}
              </td>

              <td className="px-5 py-4">
                {rental.itemCount}
              </td>

              <td className="px-5 py-4 font-medium">
                ₹
                {rental.totalAmount.toLocaleString(
                  "en-IN",
                )}
              </td>

              <td className="px-5 py-4">
                <RentalStatusBadge
                  status={rental.status}
                />
              </td>

              <td className="px-5 py-4">
                <button
                  onClick={() => onView(rental.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-highlight"
                >
                  <Eye size={16} />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rentals.length === 0 && (
        <div className="p-12 text-center text-text-muted">
          No rentals found.
        </div>
      )}
    </div>
  );
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default RentalTable;