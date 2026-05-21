interface SignInParams {
  email: string;
  password: string;
}

export const signin = async (data: SignInParams) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || "Something went wrong");
  }

  return body;
};
