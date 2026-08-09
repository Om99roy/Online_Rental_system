import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RentalSummary } from "../types/rentalSummary";

interface RentalDashboardStore {
  rentals: RentalSummary[];
  addRental: (rental: RentalSummary) => void;
}

export const useRentalDashboardStore = create<RentalDashboardStore>()(
  persist(
    (set) => ({
      rentals: [],
      addRental: (rental) => set((state) => ({ rentals: [rental, ...state.rentals] })),
    }),
    { name: "rental-dashboard-storage" }
  )
);
