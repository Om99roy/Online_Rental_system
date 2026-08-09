import axios from "axios";
import { API } from "../api";
import type { Address, NewAddressInput } from "../../types/address";

function authHeaders() {
  const accessToken = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${accessToken}` };
}

export async function fetchAddresses(): Promise<Address[]> {
  const res = await axios.get(API.ADDRESSES.LIST, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data.data;
}

export async function createAddressApi(
  input: NewAddressInput,
): Promise<Address> {
  const res = await axios.post(API.ADDRESSES.CREATE, input, {
    headers: authHeaders(),
    withCredentials: true,
  });
  return res.data.data;
}

export async function deleteAddressApi(id: string): Promise<void> {
  await axios.delete(API.ADDRESSES.DELETE(id), {
    headers: authHeaders(),
    withCredentials: true,
  });
}

export async function setDefaultAddressApi(id: string): Promise<void> {
  await axios.patch(
    API.ADDRESSES.SET_DEFAULT(id),
    {},
    { headers: authHeaders(), withCredentials: true },
  );
}
