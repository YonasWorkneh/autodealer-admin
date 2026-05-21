import { API_URL } from "@/lib/config";

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
    email: string;
  };
}

function getErrorMessage(data: unknown): string {
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

export const signup = async (data: SignUpParams): Promise<SignUpResponse> => {
  const res = await fetch(`${API_URL}/auth/registration/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(body));
  return body as SignUpResponse;
};

export const setAdminRole = async (userId: number) => {
  const res = await fetch(`${API_URL}/users/me/roles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: userId, role: "admin" }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(body));
  return body;
};
