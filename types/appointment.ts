import { Service } from "./service"

export interface AppointmentService {
  id: string
  appointmentId: string
  serviceId: string
  service: Service
  createdAt: string
}

export interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  startTime: string
  endTime: string
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  isManual: boolean
  createdAt: string
  updatedAt: string
  userId: string
  appointmentServices: AppointmentService[]
}

export interface CreateAppointmentDTO {
  customerName: string
  customerPhone: string
  startTime: string
  endTime: string
  serviceIds: string[]
}

export interface UpdateAppointmentDTO extends Omit<Appointment, 'appointmentServices'> {
  appointmentServices: Array<{
    serviceId: string
    service: Service
  }>
} 