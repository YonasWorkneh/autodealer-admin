// app/api/me/route.ts
import { cookies, headers } from "next/headers";

const api = process.env.BASE_API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh")?.value;
  let outside;
  try {
    const response = await fetch(`${api}/auth/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) throw new Error("Error updating tokens");
    const data = await response.json();
    outside = data;
    if (data.refresh || data.access)
      throw new Error("tokens are not available");
    cookieStore.set({
      name: "access",
      value: data?.access,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 15, // 15 minutes
    });
    cookieStore.set({
      name: "refresh",
      value: data?.refresh,
      httpOnly: true, // 🔑 makes it HttpOnly
      secure: true, // only over HTTPS
      sameSite: "strict", // prevent CSRF
      path: "/", // send on all requests
      maxAge: 60 * 60 * 24 * 30, // 30d minutes
    });
    const res = await fetch(`${api}/auth/user/`, {
      headers: { Authorization: `Bearer ${data?.access}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user.");
    const user = await res.json();
    return Response.json(
      {
        ok: true,
        message: "succesfully refreshed tokens.",
        user,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err.message);
    return Response.json(
      JSON.stringify({
        ok: false,
        message: err.message,
        outside,
      }),
      { status: 500 }
    );
  }
}
