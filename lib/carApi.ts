import type { Car, FetchedCar, FetchedCarDetail } from "@/app/types/Car"; // move your interfaces to a types file for reusability
import { Favorite } from "@/app/types/Favorite";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";
import type { CarView } from "@/app/types/CarView";
import { getCredentials } from "./credential";
import { API_URL } from "./config";

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
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

export async function fetchCarById(id: string): Promise<FetchedCarDetail> {
  const credential = await getCredentials();
  return fetcher<FetchedCarDetail>(`/inventory/cars/${id}`, {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

/** Backend may return a plain array or paginated { results: [...] }; normalize to Make[] */
function normalizeMakes(raw: unknown): Make[] {
  if (Array.isArray(raw)) {
    return raw.map((m: any) => ({
      id: Number(m?.id ?? m?.pk ?? 0),
      name: String(m?.name ?? m?.make_name ?? m?.title ?? ""),
    })).filter((m) => m.id && m.name);
  }
  if (raw && typeof raw === "object" && "results" in raw && Array.isArray((raw as { results: unknown[] }).results)) {
    return normalizeMakes((raw as { results: unknown[] }).results);
  }
  return [];
}

export async function fetchMakes(): Promise<Make[]> {
  const raw = await fetcher<unknown>("/inventory/makes/");
  return normalizeMakes(raw);
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
    const res = await fetch(`${API_URL}/inventory/makes/`, {
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
  make,
}: {
  name: string;
  make: number;
}) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/inventory/models/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credential.access}`,
      },
      body: JSON.stringify({ name, make }),
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

export async function deleteCar(id: number) {
  const credential = await getCredentials();
  const res = await fetch(`${API_URL}/inventory/cars/${id}/`, {
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
  const res = await fetch(`${API_URL}/inventory/car-views/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${crednetial.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip_address, car_id }),
  });
  const data = await res.json();
  return data;
}

export async function makeCarFavorite(id: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${API_URL}/inventory/car-favorites/`, {
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
    const res = await fetch(`${API_URL}/inventory/car-favorites/`, {
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
    const res = await fetch(`${API_URL}/inventory/car-favorites/${id}/`, {
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
    const res = await fetch(`${API_URL}/inventory/cars/${id}/verify/`, {
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
      "Network error. Please check your connection and try again.",
    );
  }
}

export async function rejectCar(id: number, reason?: string) {
  const credential = await getCredentials();
  const formData = new FormData();
  formData.append("verification_status", "rejected");
  formData.append("reason", reason || "");
  try {
    const res = await fetch(`${API_URL}/inventory/cars/${id}/verify/`, {
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
      "Network error. Please check your connection and try again.",
    );
  }
}

export async function updateMake({ id, name }: { id: number; name: string }) {
  try {
    const credential = await getCredentials();
    const res = await fetch(`${API_URL}/inventory/makes/${id}/`, {
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
    const res = await fetch(`${API_URL}/inventory/makes/${id}/`, {
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
  make,
}: {
  id: number;
  name?: string;
  make?: number;
}) {
  try {
    const credential = await getCredentials();
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload.name = name;
    if (make !== undefined) payload.make = make;

    const res = await fetch(`${API_URL}/inventory/models/${id}/`, {
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
    const res = await fetch(`${API_URL}/inventory/models/${id}/`, {
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

export async function fetchCarViews(carId: number): Promise<CarView[]> {
  const credential = await getCredentials();
  return fetcher<CarView[]>(`/analytics/view_viewers?car_id=${carId}`, {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

export async function getCarInspection(carId: number) {
  const credential = await getCredentials();
  return fetcher(`/inventory/car-inspections/${carId}/`, {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}
