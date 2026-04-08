import { getCredentials } from "./credential";
import { API_URL } from "./config";
import type {
  BrokerAdminApplication,
  BrokerAdminAction,
} from "@/app/types/BrokerAdminApplication";

function normalizeBrokerApplications(raw: unknown): BrokerAdminApplication[] {
  if (Array.isArray(raw)) return raw as BrokerAdminApplication[];
  if (
    raw &&
    typeof raw === "object" &&
    "results" in raw &&
    Array.isArray((raw as { results: unknown[] }).results)
  ) {
    return (raw as { results: BrokerAdminApplication[] }).results;
  }
  return [];
}

export async function fetchBrokerApplications(): Promise<
  BrokerAdminApplication[]
> {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/brokers/admin/brokers/`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg =
        (errorData as { detail?: string }).detail ||
        (errorData as { message?: string }).message ||
        `API error: ${res.status} ${res.statusText}`;
      throw new Error(msg);
    }

    const raw = (await res.json()) as unknown;
    return normalizeBrokerApplications(raw);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export async function postBrokerAdminAction(
  brokerId: number,
  action: BrokerAdminAction,
  rejectReason?: string,
): Promise<void> {
  try {
    const credential = await getCredentials();
    const body =
      action === "reject"
        ? JSON.stringify({
            rejection_reason: (rejectReason ?? "").trim(),
          })
        : undefined;

    const res = await fetch(
      `${API_URL}/brokers/admin/brokers/${brokerId}/${action}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credential.access}`,
          "Content-Type": "application/json",
        },
        ...(body !== undefined && { body }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg =
        (errorData as { detail?: string }).detail ||
        (errorData as { message?: string }).message ||
        `API error: ${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}
