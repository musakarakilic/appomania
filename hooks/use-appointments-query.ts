import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from "@/types/appointment";

export const useAppointmentsQuery = (selectedDate: Date) => {
  const queryClient = useQueryClient();

  // Randevuları getir
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?startDate=${selectedDate.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return response.json();
    }
  });

  // Randevu oluşturma mutation'ı
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: CreateAppointmentDTO) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      // Randevular listesini yenile
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Randevu güncelleme mutation'ı
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: UpdateAppointmentDTO) => {
      const response = await fetch(`/api/appointments/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Randevu silme mutation'ı
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete appointment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // AppointmentService silme mutation'ı
  const deleteAppointmentServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/services/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete appointment service');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments: appointmentsQuery.data,
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment: createAppointmentMutation.mutateAsync,
    updateAppointment: updateAppointmentMutation.mutateAsync,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    deleteAppointmentService: deleteAppointmentServiceMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending || deleteAppointmentServiceMutation.isPending,
  };
}; 