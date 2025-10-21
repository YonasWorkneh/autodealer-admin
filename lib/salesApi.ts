import type { Sale } from "@/app/types/Sale";
import { getCredentials } from "./credential";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${credential.access}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

export async function fetchSales(): Promise<Sale[]> {
  return fetcher<Sale[]>("/sales");
}

export async function fetchSaleById(id: string): Promise<Sale> {
  return fetcher<Sale>(`/sales/${id}`);
}

export async function createSale(saleData: Partial<Sale>): Promise<Sale> {
  return fetcher<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(saleData),
  });
}

export async function updateSale(
  id: number,
  saleData: Partial<Sale>
): Promise<Sale> {
  return fetcher<Sale>(`/sales/${id}`, {
    method: "PATCH",
    body: JSON.stringify(saleData),
  });
}

export async function deleteSale(
  id: number
): Promise<{ success: boolean; id: number }> {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}/sales/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `Delete failed: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return { success: true, id };
}
