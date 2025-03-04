"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, addMinutes, startOfTomorrow, parseISO, isSameDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { ServiceSelection } from "./service-selection"
import { TimeSelect } from "./time-select"
import { useAppointmentsQuery } from "@/hooks/use-appointments-query"
import { useServicesQuery } from "@/hooks/use-services-query"
import { Service } from "@/types/service"
import { Appointment } from "@/types/appointment"
import { useRecentCustomersQuery } from "@/hooks/use-recent-customers-query"
import { Switch } from "@/components/ui/switch"

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'edit' | 'quick';
  selectedAppointment?: Appointment | null;
}

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  type,
  selectedAppointment: initialAppointment 
}: AppointmentModalProps) => {
  const { data: session } = useSession()
  
  // React Query hooks
  const { data: services = [], isLoading: isLoadingServices } = useServicesQuery()
  const { createAppointment, updateAppointment, isCreating, isUpdating } = useAppointmentsQuery(new Date())
  const { data: recentCustomers = [], isLoading: isLoadingRecentCustomers } = useRecentCustomersQuery()
  
  // Form state'leri
  const [date, setDate] = useState<Date>(startOfTomorrow())
  const [time, setTime] = useState<string>("09:00")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [ignoreWorkingHours, setIgnoreWorkingHours] = useState(false)

  const resetForm = useCallback(() => {
    setCustomerName("");
    setCustomerPhone("");
    setSelectedServices([]);
    setDate(startOfTomorrow());
    setTime("09:00");
    setError(null);
    setIgnoreWorkingHours(false);
  }, []);

  // Gereksiz useEffect'i kaldıralım
  useEffect(() => {
    if (isOpen) {
      if (type === 'edit' && initialAppointment) {
        setDate(parseISO(initialAppointment.startTime))
        setTime(format(parseISO(initialAppointment.startTime), 'HH:mm'))
        setSelectedServices(initialAppointment.appointmentServices.map(as => as.service.id))
        setCustomerName(initialAppointment.customerName)
        setCustomerPhone(initialAppointment.customerPhone)
        setIgnoreWorkingHours(initialAppointment.isManual || false)
      } else if (type === 'create' && initialAppointment?.startTime) {
        setDate(parseISO(initialAppointment.startTime))
        setTime(format(parseISO(initialAppointment.startTime), 'HH:mm'))
        if (initialAppointment.isManual !== undefined) {
          setIgnoreWorkingHours(initialAppointment.isManual)
        }
      }
    }
  }, [isOpen, type, initialAppointment])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  // Loading state'i birleştirelim
  const isLoading = isLoadingServices || isLoadingRecentCustomers || isCreating || isUpdating

  const combineDateAndTime = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(date)
    combined.setHours(hours, minutes, 0, 0)
    return combined.toISOString()
  }

  const calculateEndTime = (date: Date, time: string, serviceId: string): string => {
    const startTime = combineDateAndTime(date, time)
    const service = services.find((s: Service) => s.id === serviceId)
    if (!service) throw new Error("Service not found")
    
    const endTime = addMinutes(parseISO(startTime), service.duration)
    return endTime.toISOString()
  }

  const selectedServicesText = useMemo(() => {
    const selectedServiceDetails = services.filter((s: Service) => selectedServices.includes(s.id))
    if (selectedServiceDetails.length === 0) return null
    
    const totalDuration = selectedServiceDetails.reduce((total: number, service: Service) => total + service.duration, 0)
    const totalPrice = selectedServiceDetails.reduce((total: number, service: Service) => total + service.price, 0)
    
    return (
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="font-medium">Selected Services:</div>
        {selectedServiceDetails.map((service: Service) => (
          <div key={service.id} className="flex justify-between items-center mt-2 text-sm">
            <span>{service.name}</span>
            <span>${service.price}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t flex justify-between items-center font-medium">
          <span>Total ({totalDuration} minutes)</span>
          <span>${totalPrice}</span>
        </div>
      </div>
    )
  }, [selectedServices, services])

  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }, [])

  const calculateTotalDuration = useCallback((serviceIds: string[]): number => {
    return serviceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return total + (service?.duration || 0)
    }, 0)
  }, [services])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!date || !time || selectedServices.length === 0) {
        throw new Error("Lütfen tüm alanları doldurun")
      }

      const startTimeISO = combineDateAndTime(date, time)
      const selectedServiceDetails = services.filter(s => selectedServices.includes(s.id))
      if (selectedServiceDetails.length === 0) throw new Error("Service not found")

      // Toplam süreyi hesapla
      const totalDuration = calculateTotalDuration(selectedServices)
      const endTimeISO = addMinutes(new Date(startTimeISO), totalDuration).toISOString()

      if (type === 'edit' && initialAppointment) {
        await updateAppointment({
          ...initialAppointment,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          startTime: startTimeISO,
          endTime: endTimeISO,
          appointmentServices: selectedServices.map(serviceId => ({
            serviceId,
            service: services.find(s => s.id === serviceId)!
          })),
          isManual: ignoreWorkingHours
        })
        toast.success("Randevu başarıyla güncellendi")
      } else {
        await createAppointment({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          startTime: startTimeISO,
          endTime: endTimeISO,
          serviceIds: selectedServices,
          isManual: ignoreWorkingHours
        })
        toast.success("Randevu başarıyla oluşturuldu")
      }

      onClose()
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : "Bir hata oluştu"
      
      // Randevu saati dolu hatası için özel mesaj
      if (errorMessage === "Appointment time is not available") {
        errorMessage = "This time slot is already booked"
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [date, time, selectedServices, customerName, customerPhone, type, initialAppointment, services, updateAppointment, createAppointment, onClose, calculateTotalDuration, ignoreWorkingHours])

  const handleTimeChange = useCallback((newTime: string) => {
    setTime(newTime)
  }, [])

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          if (window.event) {
            window.event.preventDefault();
          }
          onClose();
        }
      }}
    >
      <DialogContent 
        className={cn(
          "flex flex-col p-0 gap-0",
          type === 'quick' ? "max-w-lg" : "max-w-3xl",
          "h-[95vh]"
        )}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">
            {type === 'edit' ? "Edit Appointment" : type === 'quick' ? "Quick Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>
        <div className={cn(
          "flex-1 overflow-y-auto",
          type === 'quick' ? "p-4" : ""
        )}>
          {type === 'quick' ? (
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">1</div>
                  <h3 className="font-medium">Customer Information</h3>
                </div>
                
                <div className="pl-8 space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Quick search by phone number..."
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value)
                        const matchingCustomer = recentCustomers.find(c => c.phone.includes(e.target.value))
                        if (matchingCustomer) {
                          setCustomerName(matchingCustomer.name)
                        }
                      }}
                    />
                    {customerPhone && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setCustomerPhone("")
                          setCustomerName("")
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {recentCustomers.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {recentCustomers.map((customer, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault()
                            setCustomerName(customer.name)
                            setCustomerPhone(customer.phone)
                          }}
                          className="flex-shrink-0 px-3 py-2 border rounded-lg hover:border-primary/50 transition-colors bg-gray-50"
                        >
                          <div className="font-medium text-sm">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {customerPhone && !recentCustomers.find(c => c.phone === customerPhone) && (
                    <Input
                      placeholder="New customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">2</div>
                    <h3 className="font-medium">Service Selection</h3>
                  </div>
                  {selectedServices.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedServices([])
                      }}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="pl-8 space-y-4">
                  <ServiceSelection
                    services={services}
                    selectedServices={selectedServices}
                    isLoadingServices={isLoadingServices}
                    onToggleService={toggleService}
                  />
                  {selectedServices.length > 0 && selectedServicesText}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">3</div>
                  <h3 className="font-medium">Date & Time</h3>
                </div>
                
                <div className="pl-8 space-y-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="border rounded-md p-3"
                  />
                  <div className="pt-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="mt-1">
                      <TimeSelect
                        value={time}
                        onValueChange={handleTimeChange}
                        disabled={isLoading}
                        ignoreWorkingHours={ignoreWorkingHours}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="ignore-working-hours"
                      checked={ignoreWorkingHours}
                      onCheckedChange={setIgnoreWorkingHours}
                    />
                    <Label htmlFor="ignore-working-hours">Ignore working hours</Label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isLoadingServices || isCreating || isUpdating}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={isLoadingServices || isCreating || isUpdating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Selection</Label>
                  <ServiceSelection
                    services={services}
                    selectedServices={selectedServices}
                    isLoadingServices={isLoadingServices}
                    onToggleService={toggleService}
                  />
                  {selectedServices.length > 0 && selectedServicesText}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Date</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md"
                      appointmentDates={[]}
                    />
                  </div>
                  {date && (
                    <div className="text-sm text-muted-foreground">
                      Selected date: {format(date, "d MMMM yyyy", { locale: enUS })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <TimeSelect 
                    value={time}
                    onValueChange={handleTimeChange}
                    disabled={isLoadingServices || isCreating || isUpdating || !date}
                    ignoreWorkingHours={ignoreWorkingHours}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="ignore-working-hours-normal"
                    checked={ignoreWorkingHours}
                    onCheckedChange={setIgnoreWorkingHours}
                  />
                  <Label htmlFor="ignore-working-hours-normal">Ignore working hours</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            disabled={isLoading || selectedServices.length === 0}
            onClick={handleSubmit}
          >
            {isLoading ? "Saving..." : type === 'edit' ? "Save" : "Create Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentModal 