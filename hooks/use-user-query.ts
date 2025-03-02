import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface UserSettings {
  id?: string;
  name: string;
  email: string;
  isTwoFactorEnabled: boolean;
}

export const useUserQuery = () => {
  const { update: updateSession } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await fetch("/api/settings/account");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { name: string, email: string }) => {
      const response = await fetch("/api/settings/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          isTwoFactorEnabled: false // veya mevcut değeri kullan
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update settings");
      }

      await updateSession({ name: data.name });
      return responseData;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(['user-settings'], newData);
    }
  });

  return {
    settings: query.data as UserSettings,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync
  };
}; 