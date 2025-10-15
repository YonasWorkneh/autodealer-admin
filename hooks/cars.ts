import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCars,
  fetchCarById,
  fetchMakes,
  fetchModels,
  postCar,
  getMyAds,
  deleteCar,
  makeCarFavorite,
  carFavorites,
  removeCarFavorite,
  getPopularCars,
  approveCar,
  rejectCar,
} from "@/lib/carApi";
import type { FetchedCar } from "@/app/types/Car";

export function useCars() {
  return useQuery<FetchedCar[]>({
    queryKey: ["cars"],
    queryFn: fetchCars,
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: ["car", id],
    queryFn: () => fetchCarById(id),
    enabled: !!id, // only run if id exists
  });
}

export function useMakes() {
  return useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
  });
}

export function useModels(makeId?: number) {
  return useQuery({
    queryKey: ["models", makeId],
    queryFn: () => fetchModels(makeId),
    enabled: makeId !== undefined,
  });
}

export function usePostCar(onError?: () => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => postCar(formData),
    onError: () => {
      onError?.();
    },
    onSuccess: () => {
      // refresh list of cars after posting
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
    },
  });
}

export function useMyAds(id: number | undefined) {
  return useQuery({
    queryKey: ["my-ads"],
    queryFn: () => getMyAds(id),
    enabled: id !== undefined,
  });
}

export function useUpdateCar(onError?: () => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => postCar(formData),
    onError: () => {
      console.log("error");
      onError?.();
    },
    onSuccess: () => {
      // refresh list of cars after posting
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}

export function useDeleteCar(onError?: () => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCar(id),
    onError: (err) => {
      console.log("error", err);
      onError?.();
    },
    onSuccess: (data) => {
      console.log("data", data);
      onSuccess?.();
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["my-ads", "cars"] }),
  });
}

export function useUpdateCarViews() {
  return useMutation({});
}

export function useUpdateFavorite(
  onSuccess?: () => void,
  onError?: () => void
) {
  return useMutation({
    mutationFn: (id: number) => makeCarFavorite(id),
    onSuccess: () => onSuccess?.(),
    onError: () => onError?.(),
    onSettled: () => console.log(" settled"),
  });
}
export function useCarFavorites() {
  return useQuery({ queryKey: ["car-favorites"], queryFn: carFavorites });
}

export function useRemoveFavorite(
  onSuccess?: () => void,
  onError?: () => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCarFavorite(id),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["car-favorites"] });
    },
    onError: () => onError?.(),
  });
}

export function usePopularCars() {
  return useQuery({
    queryKey: ["popular-cars"],
    queryFn: getPopularCars,
  });
}

export function useApproveCar(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveCar(id),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car"] });
    },
    onError: () => onError?.(),
  });
}

export function useRejectCar(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rejectCar(id, reason),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car"] });
    },
    onError: () => onError?.(),
  });
}
