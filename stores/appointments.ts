import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from '@/types/appointment'
import { WorkingHours } from '@/types/working-hours'
import { Service } from '@/types/service'
import { ApiClient } from '@/lib/api-client'

interface AppointmentState {
  appointments: Appointment[]
  selectedDate: Date
  isLoading: boolean
  error: string | null
  selectedAppointment: Appointment | null
  modalState: {
    isOpen: boolean
    type: 'create' | 'edit' | 'quick'
  }
  
  // Eklenecek state'ler
  searchQuery: string
  appointmentDates: Date[]
  isDragging: boolean
  scrollIndicator: 'left' | 'right' | null
  workingHours: WorkingHours[]
  autoScrollDirection: 'left' | 'right' | null
  scrollLeft: number
  
  // UI State'leri
  activeAppointment: Appointment | null
  recentCustomers: Array<{ name: string, phone: string }>
  services: Service[]
  isLoadingServices: boolean
  
  // Actions
  setDate: (date: Date) => void
  fetchAppointments: (date: Date) => Promise<void>
  createAppointment: (data: CreateAppointmentDTO) => Promise<void>
  updateAppointment: (updatedAppointment: UpdateAppointmentDTO) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  updateAppointments: (appointments: Appointment[]) => void
  openModal: (type: 'create' | 'edit' | 'quick', appointment?: Appointment | null) => void
  closeModal: () => void
  setSearchQuery: (query: string) => void
  setAppointmentDates: (dates: Date[]) => void
  setIsDragging: (isDragging: boolean) => void
  setScrollIndicator: (direction: 'left' | 'right' | null) => void
  setWorkingHours: (hours: WorkingHours[]) => void
  setAutoScrollDirection: (direction: 'left' | 'right' | null) => void
  setScrollLeft: (position: number) => void
  setActiveAppointment: (appointment: Appointment | null) => void
  fetchWorkingHours: () => Promise<void>
  fetchServices: () => Promise<void>
  fetchRecentCustomers: () => Promise<void>
  setError: (error: string | null) => void
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools(
    (set, get) => ({
      appointments: [],
      selectedDate: new Date(),
      isLoading: false,
      error: null,
      selectedAppointment: null,
      modalState: {
        isOpen: false,
        type: 'create'
      },

      // Eklenecek state'ler
      searchQuery: '',
      appointmentDates: [],
      isDragging: false,
      scrollIndicator: null,
      workingHours: [],
      autoScrollDirection: null,
      scrollLeft: 0,
      activeAppointment: null,
      recentCustomers: [],
      services: [],
      isLoadingServices: false,

      updateAppointments: (appointments) => {
        set({ appointments })
      },

      setDate: (date) => {
        set({ selectedDate: date })
        get().fetchAppointments(date)
      },

      fetchAppointments: async (date) => {
        try {
          set({ isLoading: true, error: null });
          
          // Tarihi ISO string'e çevir
          const dateString = date.toISOString();

          const response = await ApiClient.fetch<Appointment[]>(
            `appointments?date=${dateString}`
          );

          if (response.error) throw new Error(response.error);
          
          // Debug için

          // Servisleri al
          const services = get().services;
          
          const appointmentsWithServices = response.data?.map(appointment => {
            const service = appointment.appointmentServices[0]?.service;
            
            if (!service) {
              console.warn(`Service not found for appointment ${appointment.id}`);
            }

            return {
              ...appointment,
              service: service || {
                id: 'unknown',
                name: "Service Not Found",
                duration: 0,
                price: 0
              }
            };
          }) || [];

          set({ 
            appointments: appointmentsWithServices,
            selectedDate: date 
          });
        } catch (error) {
          console.error("Error fetching appointments:", error);
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ isLoading: false });
        }
      },

      createAppointment: async (data: CreateAppointmentDTO) => {
        try {
          set({ isLoading: true, error: null });

          const response = await ApiClient.fetch<Appointment>('appointments', {
            method: 'POST',
            body: JSON.stringify(data)
          });

          if (response.error) throw new Error(response.error);
          if (!response.data) throw new Error('No data received');

          // State'i güncelle
          set(state => ({
            appointments: [...state.appointments, response.data!],
            modalState: { isOpen: false, type: 'create' },
            selectedAppointment: null
          }));

          return true;
        } catch (error) {
          console.error("Create appointment error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      openModal: (type: 'create' | 'edit' | 'quick', appointment: Appointment | null = null) => {
        set({
          modalState: { isOpen: true, type },
          selectedAppointment: appointment
        })
      },

      closeModal: () => {
        set({
          modalState: { isOpen: false, type: 'create' },
          selectedAppointment: null
        })
      },

      updateAppointment: async (updatedAppointment: UpdateAppointmentDTO) => {
        try {
          set({ isLoading: true, error: null });

          // URL'yi düzelt
          const response = await ApiClient.fetch<Appointment>(
            `appointments/${updatedAppointment.id}`,
            {
              method: 'PATCH', // PUT yerine PATCH kullan
              body: JSON.stringify({
                customerName: updatedAppointment.customerName,
                customerPhone: updatedAppointment.customerPhone,
                startTime: updatedAppointment.startTime,
                endTime: updatedAppointment.endTime,
                appointmentServices: updatedAppointment.appointmentServices
              })
            }
          );

          if (response.error) {
            console.error('Update error:', response.error);
            throw new Error(response.error);
          }

          // State'i güncelle
          set(state => ({
            appointments: state.appointments.map(appointment =>
              appointment.id === updatedAppointment.id ? response.data! : appointment
            ),
            modalState: { isOpen: false, type: 'create' },
            selectedAppointment: null
          }));

          // Randevuları yeniden yükle
          await get().fetchAppointments(get().selectedDate);

          return true;
        } catch (error) {
          console.error("Update appointment error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAppointment: async (appointmentId: string) => {
        try {
          set({ isLoading: true, error: null });
          await ApiClient.fetch(`appointments/${appointmentId}`, { 
            method: 'DELETE' 
          });
          set(state => ({
            appointments: state.appointments.filter(app => app.id !== appointmentId)
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Yeni action'lar
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setAppointmentDates: (dates) => set({ appointmentDates: dates }),
      
      setIsDragging: (isDragging) => set({ isDragging }),
      
      setScrollIndicator: (direction) => set({ scrollIndicator: direction }),
      
      setWorkingHours: (hours) => set({ workingHours: hours }),
      
      setAutoScrollDirection: (direction) => set({ autoScrollDirection: direction }),
      
      setScrollLeft: (position) => set({ scrollLeft: position }),
      
      setActiveAppointment: (appointment) => set({ activeAppointment: appointment }),

      fetchWorkingHours: async () => {
        try {
          const response = await ApiClient.fetch<WorkingHours[]>('settings/working-hours')
          if (response.error) throw new Error(response.error)
          set({ workingHours: response.data || [] })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch working hours' })
        }
      },

      fetchServices: async () => {
        try {
          set({ isLoadingServices: true, error: null });
          
          const response = await ApiClient.fetch<Service[]>('services');
          
          if (response.error) {
            throw new Error(response.error);
          }

          // API yanıtını direkt olarak kullan
          set({ 
            services: response.data || [],
            isLoadingServices: false 
          });

        } catch (error) {
          console.error("Error fetching services:", error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch services',
            services: [] // Hata durumunda boş array set et
          });
        } finally {
          set({ isLoadingServices: false });
        }
      },

      fetchRecentCustomers: async () => {
        try {
          const response = await ApiClient.fetch<Array<{ name: string, phone: string }>>('appointments/recent-customers')
          if (response.error) throw new Error(response.error)
          set({ recentCustomers: response.data || [] })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch recent customers' })
        }
      },

      setError: (error) => set({ error })
    })
  )
) 