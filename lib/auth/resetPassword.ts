const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface ResetPasswordParams {
  email: string;
}

export const resetPassword = async (data: ResetPasswordParams) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        errorData.email?.[0] ||
        `Failed to reset password (${res.status})`;
      throw new Error(errorMessage);
    }

    const response = await res.json();
    return response;
  } catch (err: any) {
    console.error(err.message);
    throw err;
  }
};
