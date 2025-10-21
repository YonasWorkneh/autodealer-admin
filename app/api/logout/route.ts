import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  try {
    cookieStore.delete("access");
    cookieStore.delete("refresh");
    return Response.json({ ok: true, message: "Logged out" }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, message: err.message }, { status: 500 });
  }
}
