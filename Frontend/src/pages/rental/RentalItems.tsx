import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import FullScreenNav from "../../components/FullScreenNav";

const RentalItems = () => {
  const navigate = useNavigate();
  const { rentalId } = useParams();

  return (
    <RentalServicePage
      title="Rental Items"
      description="Manage the products included in this rental."
      rentalId={rentalId}
      action={
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-glow">
          <Plus size={18} />
          Add Item
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2">
            <tr>
              <th className="px-5 py-4 font-semibold">
                Product
              </th>

              <th className="px-5 py-4 font-semibold">
                Quantity
              </th>

              <th className="px-5 py-4 font-semibold">
                Price
              </th>

              <th className="px-5 py-4 font-semibold">
                Subtotal
              </th>

              <th className="px-5 py-4 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b border-border">
              <td className="px-5 py-4">
                Camera
              </td>

              <td className="px-5 py-4">
                1
              </td>

              <td className="px-5 py-4">
                ₹2,000
              </td>

              <td className="px-5 py-4">
                ₹2,000
              </td>

              <td className="px-5 py-4">
                <button className="text-primary">
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </RentalServicePage>
  );
};

const RentalServicePage = ({
  title,
  description,
  rentalId,
  action,
  children,
}: {
  title: string;
  description: string;
  rentalId?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text">
      <FullScreenNav />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <button
            onClick={() =>
              navigate(`/rentals/${rentalId}`)
            }
            className="mb-5 flex items-center gap-2 text-sm text-text-muted hover:text-text"
          >
            <ArrowLeft size={17} />
            Back to Rental
          </button>

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {title}
              </h1>

              <p className="mt-1 text-text-muted">
                {description}
              </p>
            </div>

            {action}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
};

export default RentalItems;