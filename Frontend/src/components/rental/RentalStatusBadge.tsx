type RentalStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED"
  | "SCHEDULED"
  | "PAID"
  | "UNPAID"
  | "SETTLED"
  | "OPEN"
  | "RESOLVED";

interface RentalStatusBadgeProps {
  status: RentalStatus | string;
}

const RentalStatusBadge = ({
  status,
}: RentalStatusBadgeProps) => {
  const styles: Record<string, string> = {
    PENDING:
      "bg-warning/10 text-warning border-warning/30",

    CONFIRMED:
      "bg-info/10 text-info border-info/30",

    ACTIVE:
      "bg-success/10 text-success border-success/30",

    RETURNED:
      "bg-highlight/10 text-highlight border-highlight/30",

    COMPLETED:
      "bg-primary/10 text-primary border-primary/30",

    CANCELLED:
      "bg-error/10 text-error border-error/30",

    SCHEDULED:
      "bg-info/10 text-info border-info/30",

    PAID:
      "bg-success/10 text-success border-success/30",

    UNPAID:
      "bg-error/10 text-error border-error/30",

    SETTLED:
      "bg-success/10 text-success border-success/30",

    OPEN:
      "bg-warning/10 text-warning border-warning/30",

    RESOLVED:
      "bg-success/10 text-success border-success/30",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ??
        "border-border bg-surface-2 text-text-muted"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default RentalStatusBadge;