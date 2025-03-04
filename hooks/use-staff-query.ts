"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Staff, CreateStaffInput, UpdateStaffInput } from "@/types/staff"

export const useStaffQuery = () => {
  const queryClient = useQueryClient()

  // Staff verilerini getir
  const staffQuery = useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const response = await fetch("/api/settings/staff")
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch staff")
      }
      return response.json()
    }
  })

  // Staff oluşturma mutation'ı
  const createStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffInput) => {
      const response = await fetch("/api/settings/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create staff")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    }
  })

  // Staff güncelleme mutation'ı
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Omit<UpdateStaffInput, "id">) => {
      const response = await fetch(`/api/settings/staff/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update staff")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    }
  })

  // Staff silme mutation'ı
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/staff/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete staff")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
    }
  })

  // Helper function to update staff with separate id and data parameters
  const updateStaffHelper = async (id: string, data: Omit<UpdateStaffInput, "id">) => {
    return updateStaffMutation.mutateAsync({ id, ...data });
  };

  return {
    staff: staffQuery.data,
    isLoading: staffQuery.isLoading,
    error: staffQuery.error,
    createStaff: createStaffMutation.mutateAsync,
    updateStaff: updateStaffHelper,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    isUpdating: updateStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending
  }
} 