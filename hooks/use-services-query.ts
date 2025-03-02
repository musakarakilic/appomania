import { useQuery } from "@tanstack/react-query";
import { Service } from "@/types/service";

export const useServicesQuery = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json() as Promise<Service[]>;
    },
    staleTime: 1000, // 1 saniye
    refetchOnWindowFocus: true,
  });
}; 