import { getCredentials } from "./credential";
import { API_URL } from "./config";
import type {
  Advertisement,
  CreateAdvertisementPayload,
} from "@/app/types/Advertisement";

function normalizeAdvertisements(raw: unknown): Advertisement[] {
  if (Array.isArray(raw)) return raw as Advertisement[];
  if (
    raw &&
    typeof raw === "object" &&
    "results" in raw &&
    Array.isArray((raw as { results: unknown[] }).results)
  ) {
    return (raw as { results: Advertisement[] }).results;
  }
  return [];
}

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/advertisments/`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        (errorData as { detail?: string; message?: string }).detail ||
        (errorData as { message?: string }).message ||
        `API error: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }

    const raw = (await res.json()) as unknown;
    return normalizeAdvertisements(raw);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export async function createAdvertisement(
  payload: CreateAdvertisementPayload
): Promise<Advertisement> {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/advertisments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        (errorData as { detail?: string; message?: string }).detail ||
        (errorData as { message?: string }).message ||
        `API error: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return (await res.json()) as Advertisement;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}
