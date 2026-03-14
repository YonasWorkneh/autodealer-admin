"use server";
import { API_URL_SERVER } from "@/lib/config";

interface SignUpParams {
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
}

interface SignUpResponse {
  access: string;
  refresh: string;
  user: {
    pk: number;
    email: "user@example.com";
  };
}

function getErrorMessageFromResponse(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong";
  const d = data as Record<string, unknown>;
  if (typeof d.detail === "string") return d.detail;
  if (typeof d.message === "string") return d.message;
  if (Array.isArray(d.non_field_errors) && d.non_field_errors[0]) return String(d.non_field_errors[0]);
  const firstField = Object.keys(d).find((k) => Array.isArray(d[k]) && (d[k] as string[]).length);
  if (firstField && Array.isArray(d[firstField])) return String((d[firstField] as string[])[0]);
  return "Something went wrong";
}

export const signup = async (data: SignUpParams) => {
  try {
    const res = await fetch(`${API_URL_SERVER}/auth/registration/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getErrorMessageFromResponse(body));
    return body as SignUpResponse;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const setAdminRole = async (userId: number) => {
  try {
    const res = await fetch(`${API_URL_SERVER}/users/me/roles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: userId,
        role: "admin",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getErrorMessageFromResponse(body));
    return body;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
