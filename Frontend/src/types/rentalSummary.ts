export type RentalDashboardStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface RentalSummary {
  id: string;
  rentalNumber: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  itemCount: number;
  totalAmount: number;
  status: RentalDashboardStatus;
}
