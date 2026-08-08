import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, NewAddressInput } from "../types/address";

interface AddressStore {
  addresses: Address[];
  addAddress: (input: NewAddressInput) => Address;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (input) => {
        const isFirst = get().addresses.length === 0;
        const newAddress: Address = {
          ...input,
          id: crypto.randomUUID(),
          isDefault: isFirst,
        };
        set((state) => ({ addresses: [...state.addresses, newAddress] }));
        return newAddress;
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefault: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },
    }),
    { name: "address-storage" },
  ),
);
