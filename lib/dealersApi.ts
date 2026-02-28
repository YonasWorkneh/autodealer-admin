import { getCredentials } from "./credential";
import type { Enterprise } from "@/app/types/Enterprise";
import type { DealerAction } from "@/app/types/Enterprise";

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

export async function fetchDealers(): Promise<Enterprise[]> {
  return fetcher<Enterprise[]>("/dealers/admin/dealers");
}

export type DealerActionPayload = {
  reason?: string;
};

export async function dealerAction(
  id: number,
  action: DealerAction,
  payload?: DealerActionPayload,
): Promise<unknown> {
  const credential = await getCredentials();
  const body =
    action === "reject" && payload != null
      ? JSON.stringify({ reason: payload.reason ?? "" })
      : undefined;

  const res = await fetch(
    `${BASE_URL}/dealers/admin/dealers/${id}/${action}/`,
    {
      method: action === "verify" ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      ...(body !== undefined && { body }),
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return res.json() as Promise<unknown>;
}
