import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkingHours } from "@/types/working-hours";
import { ApiClient } from "@/lib/api-client";

export function useWorkingHoursQuery() {
  const queryClient = useQueryClient();

  const { data: workingHours = [], isLoading, error } = useQuery<WorkingHours[]>({
    queryKey: ["workingHours"],
    queryFn: async () => {
      const response = await ApiClient.fetch<WorkingHours[]>("settings/working-hours");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    }
  });

  const { mutate: createDefaultWorkingHours } = useMutation({
    mutationFn: async () => {
      const response = await ApiClient.fetch("settings/working-hours", {
        method: "POST"
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workingHours"] });
    }
  });

  return {
    workingHours,
    isLoading,
    error,
    createDefaultWorkingHours
  };
} 