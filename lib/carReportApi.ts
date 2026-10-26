import type {
  CarReport,
  UpdateCarReportPayload,
  ReviewCarReportPayload,
} from "@/app/types/CarReport";
import { getCredentials } from "./credential";
import { API_URL } from "./config";

function getErrorMessage(errorData: unknown, res: Response): string {
  const fallback = `Request failed (${res.status} ${res.statusText})`;
  if (errorData == null) return fallback;

  if (Array.isArray(errorData)) {
    const strings = errorData.filter((x): x is string => typeof x === "string");
    if (strings.length) return strings.join(" ");
    return fallback;
  }

  if (typeof errorData === "object") {
    const d = errorData as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail) && d.detail[0] != null) {
      return d.detail.map((x) => String(x)).join(" ");
    }
    if (typeof d.message === "string") return d.message;

    if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
      return String(d.non_field_errors[0]);
    }

    const firstKey = Object.keys(d).find(
      (k) => Array.isArray(d[k]) && (d[k] as unknown[]).length > 0
    );
    if (firstKey && Array.isArray(d[firstKey])) {
      return `${firstKey}: ${String((d[firstKey] as unknown[])[0])}`;
    }
  }

  return fallback;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const credential = await getCredentials();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${credential?.access}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(getErrorMessage(errorData, res));
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

function normalizeReports(raw: unknown): CarReport[] {
  if (Array.isArray(raw)) {
    return raw as CarReport[];
  }
  if (
    raw &&
    typeof raw === "object" &&
    "results" in raw &&
    Array.isArray((raw as { results: unknown[] }).results)
  ) {
    return (raw as { results: CarReport[] }).results;
  }
  return [];
}

export async function fetchCarReports(): Promise<CarReport[]> {
  const raw = await request<unknown>("/inventory/car-reports/");
  return normalizeReports(raw);
}

export async function fetchCarReportById(id: number): Promise<CarReport> {
  return request<CarReport>(`/inventory/car-reports/${id}/`);
}

export async function updateCarReport(
  id: number,
  payload: UpdateCarReportPayload
): Promise<CarReport> {
  return request<CarReport>(`/inventory/car-reports/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCarReport(id: number): Promise<void> {
  await request<void>(`/inventory/car-reports/${id}/`, {
    method: "DELETE",
  });
}

export async function reviewCarReport(
  id: number,
  payload: ReviewCarReportPayload
): Promise<CarReport> {
  return request<CarReport>(`/inventory/car-reports/${id}/review/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

