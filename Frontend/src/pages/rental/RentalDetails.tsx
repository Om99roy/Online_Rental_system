import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  Undo2,
  TriangleAlert,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import RentalStatusBadge from "../../components/rental/RentalStatusBadge";
import RentalTimeline from "../../components/rental/RentalTimeline";
import FullScreenNav from "../../components/FullScreenNav";

const RentalDetails = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text">
      <FullScreenNav />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <button
            onClick={() => navigate("/rentals")}
            className="mb-5 flex items-center gap-2 text-sm text-text-muted hover:text-text"
          >
            <ArrowLeft size={17} />
            Back to rentals
          </button>

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  RNT-001
                </h1>

                <RentalStatusBadge status="ACTIVE" />
              </div>

              <p className="mt-1 text-text-muted">
                Rental ID: {rentalId}
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/invoice`,
                )
              }
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 font-medium hover:bg-surface-2"
            >
              <FileText size={18} />
              View Invoice
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
              <h2 className="mb-5 text-lg font-semibold">
                Rental Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Info label="Customer" value="John Doe" />
                <Info
                  label="Email"
                  value="john@example.com"
                />
                <Info
                  label="Phone"
                  value="+91 9876543210"
                />
                <Info label="Items" value="3 items" />
                <Info
                  label="Start Date"
                  value="08 Aug 2026"
                />
                <Info
                  label="End Date"
                  value="10 Aug 2026"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="text-sm text-text-muted">
                Total Amount
              </p>

              <p className="mt-2 text-3xl font-bold text-primary">
                ₹4,500
              </p>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-sm text-text-muted">
                  Customer
                </p>

                <p className="mt-1 font-semibold">
                  John Doe
                </p>
              </div>
            </div>
          </div>

          <h2 className="mb-4 mt-8 text-lg font-semibold">
            Rental Management
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ManagementCard
              icon={<Package />}
              title="Rental Items"
              description="Manage rented products"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/items`,
                )
              }
            />

            <ManagementCard
              icon={<CreditCard />}
              title="Payments"
              description="Manage rental payments"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/payments`,
                )
              }
            />

            <ManagementCard
              icon={<Truck />}
              title="Pickup"
              description="Manage rental pickup"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/pickup`,
                )
              }
            />

            <ManagementCard
              icon={<Undo2 />}
              title="Return"
              description="Process rental return"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/return`,
                )
              }
            />

            <ManagementCard
              icon={<ShieldCheck />}
              title="Security Deposit"
              description="Manage security deposit"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/deposit`,
                )
              }
            />

            <ManagementCard
              icon={<TriangleAlert />}
              title="Damage Reports"
              description="Review damage reports"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/damage`,
                )
              }
            />

            <ManagementCard
              icon={<FileText />}
              title="Invoice"
              description="View rental invoice"
              onClick={() =>
                navigate(
                  `/rentals/${rentalId}/invoice`,
                )
              }
            />

            <ManagementCard
              icon={<CalendarDays />}
              title="Timeline"
              description="View rental lifecycle"
              onClick={() => {}}
            />
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-8 font-semibold">
              Rental Lifecycle
            </h2>

            <RentalTimeline
              steps={[
                {
                  title: "Created",
                  completed: true,
                },
                {
                  title: "Confirmed",
                  completed: true,
                },
                {
                  title: "Pickup",
                  completed: true,
                },
                {
                  title: "Active",
                  current: true,
                },
                {
                  title: "Return",
                },
                {
                  title: "Completed",
                },
              ]}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-sm text-text-muted">
      {label}
    </p>

    <p className="mt-1 font-medium">
      {value}
    </p>
  </div>
);

const ManagementCard = ({
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
    className="rounded-xl border border-border bg-surface p-5 text-left transition hover:border-primary/50 hover:bg-surface-2"
  >
    <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3 text-primary">
      {icon}
    </div>

    <p className="font-semibold">
      {title}
    </p>

    <p className="mt-1 text-sm text-text-muted">
      {description}
    </p>
  </button>
);

export default RentalDetails;