import type { Car, FetchedCar } from "@/app/types/Car"; // move your interfaces to a types file for reusability
import { Favorite } from "@/app/types/Favorite";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";
import { getCredentials } from "./credential";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchCars(): Promise<FetchedCar[]> {
  const credential = await getCredentials();
  return fetcher<FetchedCar[]>("/inventory/cars/", {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

export async function fetchCarById(id: string): Promise<FetchedCar> {
  const credential = await getCredentials();
  return fetcher<FetchedCar>(`/inventory/cars/${id}`, {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

export async function fetchMakes(): Promise<Make[]> {
  return fetcher<Make[]>("/inventory/makes/");
}

export async function fetchModels(makeId?: number): Promise<Model[]> {
  const url = makeId
    ? `/inventory/models/?make=${makeId}`
    : "/inventory/models/";
  return fetcher<Model[]>(url);
}

export async function createMake(name: string) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${BASE_URL}/inventory/makes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential.access}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to create make (${res.status})`;
      throw new Error(message);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error creating make.");
  }
}

export async function createModel({
  name,
  make_id,
}: {
  name: string;
  make_id: number;
}) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${BASE_URL}/inventory/models/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential.access}`,
      },
      body: JSON.stringify({ name, make_id }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to create model (${res.status})`;
      throw new Error(message);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error creating model.");
  }
}

export async function postCar(formData: FormData): Promise<Car> {
  const credential = await getCredentials();

  return fetcher<Car>("/inventory/cars/", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

export async function getMyAds(id: number | undefined) {
  if (!id) return [];
  const credential = await getCredentials();
  const myAds = await fetcher<FetchedCar[]>("/inventory/cars/", {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
  return myAds.filter((car) => car.broker === id);
}

export async function deleteCar(id: number) {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}/inventory/cars/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
  }

  // Return something serializable (plain object)
  return { success: true, id };
}

export async function updateCarViews(car_id: number, ip_address: string) {
  const crednetial = await getCredentials();
  const res = await fetch(`${BASE_URL}/inventory/car-views/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${crednetial.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip_address, car_id }),
  });
  const data = await res.json();
}

export async function makeCarFavorite(id: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ car: id }),
    });
    if (!res.ok) throw new Error(`Something went wrong`);
  } catch (err) {
    throw err;
  }
}

export async function carFavorites() {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
    if (!res.ok) throw new Error("Error fetching favorite cars.");
    const data: Favorite[] = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

export async function removeCarFavorite(id: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
    if (!res.ok) throw new Error("Error removing favorite car.");
    return { success: true, id };
  } catch (err) {
    throw err;
  }
}

export async function getPopularCars() {
  try {
    const popularCars = await fetcher<FetchedCar[]>("/inventory/popular-cars/");
    return popularCars;
  } catch (err) {
    throw err;
  }
}

export async function approveCar(id: number) {
  const credential = await getCredentials();
  const formData = new FormData();
  formData.append("verification_status", "verified");
  try {
    const res = await fetch(`${BASE_URL}/inventory/cars/${id}/verify/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        `Failed to approve car (${res.status})`;
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.log("error message", err.message);
    if (err.message) {
      throw err;
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
}

export async function rejectCar(id: number, reason?: string) {
  const credential = await getCredentials();
  const formData = new FormData();
  formData.append("verification_status", "rejected");
  formData.append("reason", reason || "");
  try {
    const res = await fetch(`${BASE_URL}/inventory/cars/${id}/verify/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        `Failed to reject car (${res.status})`;
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    if (err.message) {
      throw new Error(err.message);
    }
    throw new Error(
      "Network error. Please check your connection and try again."
    );
  }
}

export async function updateMake({ id, name }: { id: number; name: string }) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${BASE_URL}/inventory/makes/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential.access}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to update make (${res.status})`;
      throw new Error(message);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error updating make.");
  }
}

export async function deleteMake(id: number) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${BASE_URL}/inventory/makes/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to delete make (${res.status})`;
      throw new Error(message);
    }

    return { success: true, id };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error deleting make.");
  }
}

export async function updateModel({
  id,
  name,
  make_id,
}: {
  id: number;
  name?: string;
  make_id?: number;
}) {
  try {
    const credential = await getCredentials();
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload.name = name;
    if (make_id !== undefined) payload.make_id = make_id;

    const res = await fetch(`${BASE_URL}/inventory/models/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential.access}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to update model (${res.status})`;
      throw new Error(message);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error updating model.");
  }
}

export async function deleteModel(id: number) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${BASE_URL}/inventory/models/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        errorData.message ||
        `Failed to delete model (${res.status})`;
      throw new Error(message);
    }

    return { success: true, id };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unexpected error deleting model.");
  }
}
