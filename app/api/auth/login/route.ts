import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/users/admin/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return Response.json(
        { error: getErrorMessage(data) },
        { status: res.status },
      );
    }

    if (!data?.access) {
      return Response.json(
        { error: "Error trying to log you in. Please try again." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("access", data.access);
    cookieStore.set("refresh", data.refresh);

    return Response.json({ user: data.user });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
