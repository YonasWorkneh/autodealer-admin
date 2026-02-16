"use server";
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

export const signup = async (data: SignUpParams) => {
  try {
    const res = await fetch(`${process.env.BASE_API_URL}/auth/registration/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Something went wrong");
    const user = (await res.json()) as SignUpResponse;

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};

export const setAdminRole = async (userId: number) => {
  try {
    const res = await fetch(`${process.env.BASE_API_URL}/users/me/roles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: userId,
        role: "admin",
      }),
    });
    if (!res.ok) throw new Error("Something went wrong");
    const user = await res.json();

    return user;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
