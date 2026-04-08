import { getCredentials } from "./credential";
import { API_URL } from "./config";
import type { Enterprise } from "@/app/types/Enterprise";
import type { DealerAction } from "@/app/types/Enterprise";

/** Normalize dealer API error JSON: e.g. `["Only pending dealers can be approved."]`, `{ detail }`, field errors. */
function getDealerApiErrorMessage(errorData: unknown, res: Response): string {
  const fallback = `Request failed (${res.status} ${res.statusText})`;

  if (errorData == null) return fallback;

  if (Array.isArray(errorData)) {
    const strings = errorData.filter((x): x is string => typeof x === "string");
    if (strings.length) return strings.join(" ");
    return fallback;
  }

  if (typeof errorData === "object") {
    const d = errorData as Record<string, unknown>;

    const detail = d.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0] != null) {
      return detail.map((x) => String(x)).join(" ");
    }

    if (typeof d.message === "string") return d.message;

    if (Array.isArray(d.non_field_errors) && d.non_field_errors.length) {
      return String(d.non_field_errors[0]);
    }

    const firstField = Object.keys(d).find(
      (k) =>
        Array.isArray(d[k]) && (d[k] as unknown[]).length > 0,
    );
    if (firstField && Array.isArray(d[firstField])) {
      return String((d[firstField] as unknown[])[0]);
    }
  }

  return fallback;
}

export async function fetchDealers(): Promise<Enterprise[]> {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/dealers/admin/dealers`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(getDealerApiErrorMessage(errorData, res));
    }

    return res.json() as Promise<Enterprise[]>;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export type DealerActionPayload = {
  rejection_reason?: string;
};

export type RegisterDealerPayload = {
  email: string;
  password: string;
  company_name: string;
  license_number: string;
  tax_id: string;
  telebirr_account: string;
};

export async function dealerAction(
  id: number,
  action: DealerAction,
  payload?: DealerActionPayload,
): Promise<unknown> {
  try {
    const credential = await getCredentials();

    let body: string | undefined;
    if (action === "verify") {
      body = JSON.stringify({ is_verified: true });
    } else if (action === "reject" && payload != null) {
      body = JSON.stringify({
        rejection_reason: (payload.rejection_reason ?? "").trim(),
      });
    }

    const res = await fetch(
      `${API_URL}/dealers/admin/dealers/${id}/${action}/`,
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
      const errorData = await res.json().catch(() => null);
      throw new Error(getDealerApiErrorMessage(errorData, res));
    }

    return res.json() as Promise<unknown>;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export async function registerDealer(
  payload: RegisterDealerPayload,
): Promise<unknown> {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/users/auth/register_dealer/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(getDealerApiErrorMessage(errorData, res));
    }

    return res.json() as Promise<unknown>;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}
