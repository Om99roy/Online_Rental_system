import { create } from "zustand";
import type { Address, NewAddressInput } from "../types/address";
import {
  fetchAddresses,
  createAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
} from "../lib/api/address.api";
import toast from "react-hot-toast";

interface AddressStore {
  addresses: Address[];
  loading: boolean;
  loadAddresses: () => Promise<void>;
  addAddress: (input: NewAddressInput) => Promise<Address | null>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  loading: false,

  loadAddresses: async () => {
    set({ loading: true });
    try {
      const addresses = await fetchAddresses();
      set({ addresses });
    } catch (err) {
      toast.error("Could not load addresses");
    } finally {
      set({ loading: false });
    }
  },

  addAddress: async (input) => {
    try {
      const newAddress = await createAddressApi(input);
      set({ addresses: [...get().addresses, newAddress] });
      return newAddress;
    } catch (err) {
      toast.error("Could not save address");
      return null;
    }
  },

  removeAddress: async (id) => {
    try {
      await deleteAddressApi(id);
      set({ addresses: get().addresses.filter((a) => a.id !== id) });
    } catch (err) {
      toast.error("Could not remove address");
    }
  },

  setDefault: async (id) => {
    try {
      await setDefaultAddressApi(id);
      set({
        addresses: get().addresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        })),
      });
    } catch (err) {
      toast.error("Could not update default address");
    }
  },
}));
