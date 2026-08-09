import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RentalPageHeader from "../../components/rental/RentalPageHeader";
import RentalStatCard from "../../components/rental/RentalStatCard";
import RentalTable from "../../components/rental/RentalTable";
import FullScreenNav from "../../components/FullScreenNav";

import { useRentalDashboardStore } from "../../store/RentalDashboard";

const RentalDashboard = () => {
  const navigate = useNavigate();

  // Get rentals from Zustand instead of hardcoded data
  const rentals = useRentalDashboardStore(
    (state) => state.rentals,
  );

  const [search, setSearch] = useState("");

  const filteredRentals = useMemo(() => {
    const value = search.toLowerCase();

    return rentals.filter(
      (rental) =>
        rental.rentalNumber
          .toLowerCase()
          .includes(value) ||
        rental.customerName
          .toLowerCase()
          .includes(value) ||
        rental.customerEmail
          .toLowerCase()
          .includes(value),
    );
  }, [rentals, search]);

  const revenue = rentals.reduce(
    (total, rental) =>
      total + rental.totalAmount,
    0,
  );

  const activeRentals = rentals.filter(
    (rental) => rental.status === "ACTIVE",
  ).length;

  const pendingRentals = rentals.filter(
    (rental) => rental.status === "PENDING",
  ).length;

  return (
    <div className="min-h-screen bg-background text-text">

      <FullScreenNav />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <RentalPageHeader
            title="Rental Dashboard"
            description="Manage rentals and the complete rental lifecycle."
            action={
              <button
                onClick={() =>
                  navigate("/rentals/create")
                }
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-white transition hover:bg-glow"
              >
                <Plus size={18} />
                New Rental
              </button>
            }
          />

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <RentalStatCard
              title="Total Rentals"
              value={rentals.length}
              description="All rental transactions"
              icon={<Package size={20} />}
            />

            <RentalStatCard
              title="Active Rentals"
              value={activeRentals}
              description="Currently rented"
              icon={<CheckCircle2 size={20} />}
            />

            <RentalStatCard
              title="Pending"
              value={pendingRentals}
              description="Awaiting confirmation"
              icon={<Clock3 size={20} />}
            />

            <RentalStatCard
              title="Revenue"
              value={`₹${revenue.toLocaleString("en-IN")}`}
              description="Total rental value"
              icon={<DollarSign size={20} />}
            />

          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

            <QuickAction
              icon={<Plus size={20} />}
              title="Create Rental"
              description="Start a new rental transaction"
              onClick={() =>
                navigate("/rentals/create")
              }
            />

            <QuickAction
              icon={<CalendarCheck size={20} />}
              title="Pickup Management"
              description="Manage scheduled pickups"
              onClick={() =>
                navigate("/rentals/pickups")
              }
            />

            <QuickAction
              icon={<AlertTriangle size={20} />}
              title="Damage Reports"
              description="Review reported damages"
              onClick={() =>
                navigate("/rentals/damage-reports")
              }
            />

          </div>

          {/* Rental Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface">

            <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="font-semibold">
                  Recent Rentals
                </h2>

                <p className="mt-1 text-sm text-text-muted">
                  View and manage rental transactions.
                </p>
              </div>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  type="text"
                  placeholder="Search rentals..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary sm:w-72"
                />

              </div>

            </div>

            <RentalTable
              rentals={filteredRentals}
              onView={(id) =>
                navigate(`/rentals/${id}`)
              }
            />

          </div>

        </div>
      </main>
    </div>
  );
};

const QuickAction = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 text-left transition hover:border-primary/50 hover:bg-surface-2"
  >
    <div className="rounded-lg bg-primary/10 p-3 text-primary">
      {icon}
    </div>

    <div>
      <p className="font-semibold">{title}</p>

      <p className="mt-1 text-sm text-text-muted">
        {description}
      </p>
    </div>
  </button>
);

export default RentalDashboard;