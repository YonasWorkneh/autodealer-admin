"use server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";

interface SignInParams {
  email: string;
  password: string;
}

function getErrorMessageFromResponse(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong";
  const d = data as Record<string, unknown>;
  if (typeof d.detail === "string") return d.detail;
  if (typeof d.message === "string") return d.message;
  if (Array.isArray(d.non_field_errors) && d.non_field_errors[0])
    return String(d.non_field_errors[0]);
  const firstField = Object.keys(d).find(
    (k) => Array.isArray(d[k]) && (d[k] as string[]).length,
  );
  if (firstField && Array.isArray(d[firstField]))
    return String((d[firstField] as string[])[0]);
  return "Something went wrong";
}

export const signin = async (data: SignInParams) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getErrorMessageFromResponse(body));
    const user = body;
    if (!user?.access)
      throw new Error("Error trying to log you in. Please try again.");
    const cookiess = await cookies();
    cookiess.set("access", user?.access);
    cookiess.set("refresh", user?.refresh);

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const getUser = async (id: number) => {
  try {
    const res = await fetch(`${API_URL}/users/user-profiles/${id}`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getErrorMessageFromResponse(body));
    return body;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const cookie = await cookies();
    const access = cookie.get("access");
    const refresh = cookie.get("refresh");
    return { access, refresh };
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
