import { useQuery } from "@tanstack/react-query";

interface RecentCustomer {
  name: string;
  phone: string;
}

export const useRecentCustomersQuery = () => {
  return useQuery({
    queryKey: ['recent-customers'],
    queryFn: async () => {
      const response = await fetch("/api/appointments/recent-customers");
      if (!response.ok) {
        throw new Error('Failed to fetch recent customers');
      }
      return response.json() as Promise<RecentCustomer[]>;
    }
  });
}; 