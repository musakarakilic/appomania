"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { 
  format, 
  addDays,  
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  eachDayOfInterval, 
  parseISO, 
  setHours, 
  setMinutes, 
  addMinutes,
  differenceInMinutes,
  isValid
} from "date-fns"
import { enUS, tr } from "date-fns/locale"
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,  
  Plus, 
  X,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  MoonStar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragMoveEvent } from "@dnd-kit/core"
import { DraggableAppointment } from "./draggable-appointment"
import { createPortal } from "react-dom"
import { DroppableCell } from "./droppable-cell"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SettingsMenu } from "./settings-menu"
import { Appointment, AppointmentService } from "@/types/appointment"
import { useAppointmentsQuery } from "@/hooks/use-appointments-query"
import AppointmentModal from "./appointment-modal"
import { useQueryClient } from "@tanstack/react-query"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface WorkingHours {
  day: string
  isOpen: boolean
  startTime: string
  endTime: string
  breakStart: string
  breakEnd: string
}

interface AppointmentListProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onOpenModal: (type: 'create' | 'edit' | 'quick') => void
}


const generateTimeSlots = () => {
  const slots: Array<{
    time: string
    period: string
    display: string
  }> = []
  for (let hour = 8; hour < 22; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    const formattedHour = displayHour.toString().padStart(2, '0')
    const timeStr = `${formattedHour}:00`
    slots.push({
      time: timeStr,
      period: period,
      display: `${timeStr} ${period}`
    })
  }
  return slots
}

const timeSlots = generateTimeSlots()

const SCROLL_SPEED = 20 // Faster scrolling
const SCROLL_THRESHOLD = 150 // Wider detection area
const SCROLL_INTERVAL = 50 // Much faster response time
const VISIBLE_DAYS = 21 // Total number of days to display

export default function AppointmentList({ 
  selectedDate, 
  onDateChange,
  onOpenModal,
}: AppointmentListProps) {
  const { 
    appointments = [], // Varsayılan boş dizi
    isLoading, 
    error,
    deleteAppointment,
    deleteAppointmentService,
    updateAppointment,
    isDeleting 
  } = useAppointmentsQuery(selectedDate);

  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("")
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null)
  const [appointmentDates, setAppointmentDates] = useState<Date[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [scrollIndicator, setScrollIndicator] = useState<'left' | 'right' | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const scrollSpeedRef = useRef(SCROLL_SPEED)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollInterval = useRef<NodeJS.Timeout | null>(null)
  const [autoScrollDirection, setAutoScrollDirection] = useState<'left' | 'right' | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit' | 'quick'>('create')
  const [mounted, setMounted] = useState(false)
  const [resizingAppointment, setResizingAppointment] = useState<{
    id: string;
    initialHeight: number;
    startY: number;
    startTime: Date;
    endTime: Date;
    currentDuration: number;
    minDuration: number;
  } | null>(null);
  const quarterHeight = 32; // Height of a 15-minute segment

  // Çalışma saatlerini görmezden gelme durumu
  const [ignoreWorkingHours, setIgnoreWorkingHours] = useState(() => {
    // localStorage'dan değeri al
    const savedState = localStorage.getItem('ignoreWorkingHours');
    return savedState ? JSON.parse(savedState) : false;
  });

  // ignoreWorkingHours değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('ignoreWorkingHours', JSON.stringify(ignoreWorkingHours));
  }, [ignoreWorkingHours]);

  // ignoreWorkingHours değiştiğinde takvim görünümünü güncelle
  useEffect(() => {
    // Takvim görünümünü yeniden render etmek için state'i güncelle
    setMounted(prev => !prev);
    setMounted(prev => !prev);
  }, [ignoreWorkingHours]);

  // Calculate extendedDateRange with useMemo - increased the number of visible days
  const extendedDateRange = useMemo(() => {
    // Center the selected date (equal number of days before and after)
    const daysBeforeSelected = Math.floor(VISIBLE_DAYS / 2);
    
    // Calculate start and end dates
    const start = addDays(selectedDate, -daysBeforeSelected);
    const end = addDays(selectedDate, VISIBLE_DAYS - daysBeforeSelected - 1);
    
    return { start, end };
  }, [selectedDate]); // Only recalculate when selectedDate changes

  const extendedDays = eachDayOfInterval({ start: extendedDateRange.start, end: extendedDateRange.end });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px hareket etmeden sürükleme başlamaz
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms basılı tutmadan sürükleme başlamaz
        tolerance: 5, // 5px tolerans
      },
    })
  )

  // Çalışma saatlerini getir
  const getWorkingHours = async () => {
    try {
      const response = await fetch("/api/settings/working-hours")
      if (!response.ok) throw new Error("Failed to fetch working hours")
      const data = await response.json()
      setWorkingHours(data)
    } catch (error) {
      console.error("Error fetching working hours:", error)
      toast.error("Error loading working hours")
    }
  }

  useEffect(() => {
    getWorkingHours()
  }, [])

  // Gün dönüşüm fonksiyonu
  const getDayString = (dayIndex: number): string => {
    // JavaScript günleri: 0=Pazar, 1=Pazartesi, ...
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return days[dayIndex];
  };
  
  // Günün açık olup olmadığını kontrol et
  const isDayOpen = (date: Date): boolean => {
    if (ignoreWorkingHours) return true; // Çalışma saatleri görmezden geliniyorsa her zaman açık
    
    if (!workingHours || workingHours.length === 0) return true;
    
    const dayName = getDayString(date.getDay());
    const daySettings = workingHours.find(wh => wh.day === dayName);
    
    if (!daySettings) return true; // Eğer ayar bulunamazsa varsayılan olarak açık kabul et
    return daySettings.isOpen;
  };

  // Belirli bir zamanın başlangıç ve bitiş arasında olup olmadığını kontrol et
  const isTimeInRange = (time: string, start: string, end: string): boolean => {
    if (!start || !end) return true;
    
    // "HH:MM" formatındaki zamanları sayısal değere dönüştür
    const [timeHour, timeMinute] = time.split(':').map(Number);
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const timeValue = timeHour * 60 + timeMinute;
    const startValue = startHour * 60 + startMinute;
    const endValue = endHour * 60 + endMinute;
    
    return timeValue >= startValue && timeValue < endValue;
  };
  
  // Belirli bir saat diliminin açık olup olmadığını kontrol et
  const isTimeSlotOpen = (date: Date, timeSlot: string): boolean => {
    if (ignoreWorkingHours) return true; // Çalışma saatleri görmezden geliniyorsa her zaman açık
    
    // Önce günün açık olup olmadığını kontrol et
    if (!isDayOpen(date)) return false;
    
    const dayName = getDayString(date.getDay());
    const daySettings = workingHours?.find(wh => wh.day === dayName);
    
    // Eğer ayar bulunamazsa veya açık değilse false döndür
    if (!daySettings || !daySettings.isOpen) return false;
    
    // Saat bilgisini al
    const [hourStr, minuteStr] = timeSlot.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr || "0");
    
    // 24 saat formatında HH:MM şeklinde
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Çalışma saatleri içinde mi kontrol et
    const isInWorkingHours = isTimeInRange(formattedTime, daySettings.startTime, daySettings.endTime);
    
    // Mola zamanına denk gelip gelmediğini kontrol et
    const isInBreakTime = isTimeInRange(formattedTime, daySettings.breakStart, daySettings.breakEnd);
    
    // Çalışma saatleri içinde ve mola zamanı dışındaysa açıktır
    return isInWorkingHours && !isInBreakTime;
  };

  // Check if a time slot is during break time
  const isBreakTime = (date: Date, timeSlot: string): boolean => {
    if (ignoreWorkingHours) return false; // Çalışma saatleri görmezden geliniyorsa mola zamanı yok
    
    if (!isDayOpen(date)) return false;
    
    const dayName = getDayString(date.getDay());
    const daySettings = workingHours?.find(wh => wh.day === dayName);
    
    if (!daySettings || !daySettings.isOpen) {
      return false;
    }
    
    // Saat bilgisini al
    const [hourStr, minuteStr] = timeSlot.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr || "0");
    
    // 24 saat formatında HH:MM şeklinde
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Mola zamanına denk gelip gelmediğini kontrol et
    return isTimeInRange(formattedTime, daySettings.breakStart, daySettings.breakEnd);
  };

  // Çakışma kontrolü için geliştirilmiş fonksiyon
  const checkOverlap = (startTime: Date, endTime: Date, appointmentId?: string) => {
    const overlappingAppointments = appointments.filter((app: Appointment) => {
      if (app.id === appointmentId) return false
      
      const existingStart = parseISO(app.startTime)
      const existingEnd = parseISO(app.endTime)
      
      // Aynı gün kontrolü
      const isSameDay = existingStart.getDate() === startTime.getDate() &&
                       existingStart.getMonth() === startTime.getMonth() &&
                       existingStart.getFullYear() === startTime.getFullYear()
      
      if (!isSameDay) return false

      const hasOverlap = (startTime < existingEnd && endTime > existingStart) &&
        !(startTime.getTime() === existingEnd.getTime() || endTime.getTime() === existingStart.getTime())

      return hasOverlap
    })

    return {
      hasOverlap: overlappingAppointments.length > 0,
      overlappingAppointments
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setIsDragging(true);
    
    // Parse the composite ID to get the appointment ID
    const [appointmentId] = (active.id as string).split('-');
    const appointment = appointments.find((app: Appointment) => app.id === appointmentId);
    
    if (appointment) {
      setActiveAppointment(appointment);
      // Debug için log ekleyelim
      console.log('Drag started:', { appointmentId, appointment });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    setActiveAppointment(null)
    setAutoScrollDirection(null)
    setScrollIndicator(null)

    const { active, over } = event
    if (!over) return

    const [appointmentId, serviceId] = (active.id as string).split('-')
    const overId = over.id as string

    // Parse the target cell ID to get date and time
    const [dateStr, timeStr] = overId.split('_')
    if (!dateStr || !timeStr) return

    // Tarihi parseISO ile parse et
    const targetDate = parseISO(dateStr)
    if (!isValid(targetDate)) {
      console.error('Invalid date:', dateStr)
      return
    }

    // Saati ayarla
    const [time, period] = timeStr.split(' ')
    let [hours] = time.split(':')
    let hour = parseInt(hours)
    
    // 12 saat formatından 24 saat formatına çevir
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
    
    targetDate.setHours(hour, 0, 0, 0)

    // Önce hedef günün ve saat diliminin açık olup olmadığını kontrol et
    const dayOpen = isDayOpen(targetDate);
    const timeSlotOpen = isTimeSlotOpen(targetDate, `${time} ${period}`);

    // Eğer gün kapalıysa veya saat dilimi kapalıysa hata mesajı göster
    if (!dayOpen) {
      toast.error('This day is closed for appointments', {
        duration: 3000
      });
      return;
    }
    
    if (!timeSlotOpen) {
      toast.error('This time slot is outside working hours or during a break time', {
        duration: 3000
      });
      return;
    }

    // Find the appointment being dragged
    const draggedAppointment = appointments.find((app: Appointment) => app.id === appointmentId)
    if (!draggedAppointment) return

    // Calculate new end time
    const duration = differenceInMinutes(
      parseISO(draggedAppointment.endTime),
      parseISO(draggedAppointment.startTime)
    )
    const newEndTime = addMinutes(targetDate, duration)

    // Check for overlaps
    const { hasOverlap, overlappingAppointments } = checkOverlap(targetDate, newEndTime, appointmentId)
    
    if (hasOverlap) {
      toast.error('There are overlapping appointments in this time slot:', {
        description: overlappingAppointments.map((app: Appointment) => 
          `${app.customerName} - ${format(parseISO(app.startTime), 'HH:mm')} - ${format(parseISO(app.endTime), 'HH:mm')}`
        ).join('\n'),
        duration: 5000
      })
      return
    }

    // Check working hours
    const dayOfWeek = targetDate.getDay()

    // If working hours haven't been loaded yet, try loading them again
    if (workingHours.length === 0) {
      try {
        await getWorkingHours()
      } catch (error) {
        console.error("Error fetching working hours:", error)
        toast.error("Error loading working hours")
        return
      }
    }

    const workingHour = workingHours.find(wh => wh.day === getDayString(dayOfWeek))

    try {
      await updateAppointment({
        ...draggedAppointment,
        startTime: targetDate.toISOString(),
        endTime: newEndTime.toISOString()
      })
      toast.success('Randevu başarıyla güncellendi')
    } catch (error) {
      toast.error('Randevu güncellenirken bir hata oluştu')
    }
  }

  // Filtreleme fonksiyonu
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    
    return appointments.filter((appointment: Appointment) => {
      if (!searchQuery) return true;
      const serviceName = appointment.appointmentServices?.[0]?.service?.name || '';
      return (
        appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.customerPhone.includes(searchQuery)
      );
    });
  }, [appointments, searchQuery]);


  const getAppointmentsForDayAndTime = (day: Date, timeStr: string) => {
    // Eğer gün veya saat dilimi kapalı ise randevu gösterme
    if (!isTimeSlotOpen(day, timeStr)) {
      return [];
    }
    
    // Saat aralığını belirle
    const [hourStr, period] = timeStr.split(' ');
    const hour = parseInt(hourStr, 10);
    
    // 12 saat formatından 24 saat formatına çevir
    let adjustedHour = hour;
    if (period === 'PM' && hour !== 12) adjustedHour += 12;
    if (period === 'AM' && hour === 12) adjustedHour = 0;
    
    // Tarih ve saat oluştur
    const startOfTimeSlot = new Date(day);
    startOfTimeSlot.setHours(adjustedHour, 0, 0, 0);
    const endOfTimeSlot = new Date(day);
    endOfTimeSlot.setHours(adjustedHour + 1, 0, 0, 0);
    
    // Format ile karşılaştırmak için
    const dayStr = format(day, "yyyy-MM-dd");
    
    // Bu saat dilimine denk gelen randevuları filtrele
    return appointments.filter((appointment: Appointment) => {
      try {
        const appointmentStart = parseISO(appointment.startTime);
        const appointmentEnd = parseISO(appointment.endTime);
        
        // Aynı gün mü kontrol et
        const appointmentDayStr = format(appointmentStart, "yyyy-MM-dd");
        if (appointmentDayStr !== dayStr) return false;
        
        // Sadece randevunun başlangıç saatine denk gelen zaman diliminde göster
        return appointmentStart >= startOfTimeSlot && appointmentStart < endOfTimeSlot;
      } catch (error) {
        console.error('Error processing appointment:', error);
        return false;
      }
    });
  };

  // Auto-scroll effect - rewritten version
  useEffect(() => {
    if (autoScrollDirection && isDragging) {
      // Lower interval time for faster response (50ms)
      scrollInterval.current = setInterval(() => {
        // Handle view scrolling
        const container = containerRef.current;
        if (container) {
          // Increase scrollAmount for faster scrolling
          const scrollAmount = autoScrollDirection === 'left' ? -200 : 200;
          container.scrollBy({
            left: scrollAmount,
            behavior: 'auto' // Use auto instead of smooth for faster response
          });
          
          // Update header scroll too
          if (headerRef.current) {
            headerRef.current.scrollBy({
              left: scrollAmount,
              behavior: 'auto'
            });
          }
          
          // If scroll limits are reached, change the displayed date
          const currentScroll = container.scrollLeft;
          const maxScroll = container.scrollWidth - container.clientWidth;
          
          if ((autoScrollDirection === 'left' && currentScroll <= 0) || 
              (autoScrollDirection === 'right' && currentScroll >= maxScroll)) {
            // Update displayed date by adding 10 more days
            const newDate = addDays(selectedDate, autoScrollDirection === 'right' ? 10 : -10);
            onDateChange(newDate);
          }
        }
      }, SCROLL_INTERVAL);
    }
    
    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [autoScrollDirection, isDragging, selectedDate, onDateChange]);

  // Sürükleme sırasında fare pozisyonu tespiti
  const handleDragMove = (event: DragMoveEvent) => {
    const mouseX = (event.activatorEvent as MouseEvent).clientX;
    const windowWidth = window.innerWidth;
    
    // Geniş algılama bölgesi kullanarak daha erken tepki veriyoruz
    if (mouseX < SCROLL_THRESHOLD) {
      setAutoScrollDirection('left');
      setScrollIndicator('left');
    } else if (mouseX > windowWidth - SCROLL_THRESHOLD) {
      setAutoScrollDirection('right');
      setScrollIndicator('right');
    } else {
      setAutoScrollDirection(null);
      setScrollIndicator(null);
    }
  };

  // handleArrowScroll function - week change logic updated
  const handleArrowScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -140 : 140;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // If scroll limits are reached, change the view
    if ((direction === 'left' && currentScroll === 0) || 
        (direction === 'right' && currentScroll >= maxScroll)) {
      // Go 10 days forward or backward
      const newDate = addDays(selectedDate, direction === 'left' ? -10 : 10);
      onDateChange(newDate);
      return;
    }

    // Otherwise, do normal scrolling
    container.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  // Scroll senkronizasyonu
  useEffect(() => {
    const header = headerRef.current
    const container = containerRef.current
    
    if (!header || !container) return
    
    const handleHeaderScroll = () => {
      if (container.scrollLeft !== header.scrollLeft) {
        container.scrollLeft = header.scrollLeft
      }
    }
    
    const handleContainerScroll = () => {
      if (header.scrollLeft !== container.scrollLeft) {
        header.scrollLeft = container.scrollLeft
      }
    }
    
    header.addEventListener('scroll', handleHeaderScroll)
    container.addEventListener('scroll', handleContainerScroll)
    
    return () => {
      header.removeEventListener('scroll', handleHeaderScroll)
      container.removeEventListener('scroll', handleContainerScroll)
    }
  }, [])

  // handleDateNavigation fonksiyonu - aylık navigasyon
  const handleDateNavigation = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      // Önceki ay
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      // Sonraki ay
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  // Arama sonuçları için tip tanımlaması
  const handleSearchResultClick = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.startTime);
    onDateChange(appointmentDate);
    setSearchQuery("");
  };

  // Arama sonuçları render'ı için tip tanımlaması
  const renderSearchResults = () => {
    if (!filteredAppointments?.length) {
      return (
        <p className="text-sm text-gray-500 text-center py-2">
          No results found
        </p>
      );
    }

    return filteredAppointments.map((appointment: Appointment) => {
      const serviceName = appointment.appointmentServices?.[0]?.service?.name || 'No service';
      return (
        <button
          key={appointment.id}
          onClick={() => handleSearchResultClick(appointment)}
          className="w-full text-left p-2 rounded-lg hover:bg-gray-100"
        >
          <div className="font-medium text-sm">
            {appointment.customerName}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-between mt-1">
            <span>{serviceName}</span>
            <span>{format(parseISO(appointment.startTime), "d MMMM, HH:mm", { locale: enUS })}</span>
          </div>
        </button>
      );
    });
  };

  const handleOpenModal = (type: 'create' | 'edit' | 'quick', appointment?: Partial<Appointment>) => {
    setModalType(type)
    setSelectedAppointment(appointment ? {
      id: '',
      customerName: '',
      customerPhone: '',
      startTime: appointment.startTime || '',
      endTime: appointment.endTime || '',
      appointmentServices: [],
      userId: '',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      isManual: ignoreWorkingHours,
      ...appointment
    } as Appointment : null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAppointment(null)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus on today's date when component first loads
  useEffect(() => {
    if (mounted && containerRef.current && headerRef.current) {
      // Find today's date
      const todayIndex = extendedDays.findIndex(day => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return isSameDay(day, today);
      });
      
      // If today's index is found, scroll to that position
      if (todayIndex >= 0) {
        const cellWidth = 140; // Width of each day cell (px)
        const containerWidth = containerRef.current.clientWidth;
        const scrollPosition = Math.max(0, (todayIndex * cellWidth) - (containerWidth / 2) + (cellWidth / 2));
        
        // Scroll the container
        containerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'auto'
        });
        
        // Scroll the header too
        headerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'auto'
        });
      }
    }
  }, [mounted, extendedDays]);

  // Resize başlatma fonksiyonu
  const handleResizeStart = (e: React.MouseEvent, appointment: Appointment, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const element = e.currentTarget.closest('[data-appointment-id]') as HTMLElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const service = appointment.appointmentServices.find(as => as.service.id === serviceId);
    if (!service) return;

    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);
    const currentDuration = (end.getTime() - start.getTime()) / (1000 * 60);

    // Mouse event listeners'ları document yerine window'a ekleyelim
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    
    // Text selection'ı devre dışı bırakalım
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';

    setResizingAppointment({
      id: `${appointment.id}-${serviceId}`,
      initialHeight: rect.height,
      startY: e.clientY,
      startTime: start,
      endTime: end,
      currentDuration: currentDuration,
      minDuration: 15
    });
  };

  // Resize hareket fonksiyonu
  const handleResizeMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!resizingAppointment) return;

    requestAnimationFrame(() => {
      const deltaY = e.clientY - resizingAppointment.startY;
      const deltaQuarters = Math.round(deltaY / quarterHeight);
      const deltaMinutes = deltaQuarters * 15;

      // Yeni süreyi hesapla (minimum 15 dakika)
      const newDuration = Math.max(15, resizingAppointment.currentDuration + deltaMinutes);
      
      // Yeni bitiş zamanını hesapla
      const newEndTime = addMinutes(resizingAppointment.startTime, newDuration);
      
      // Görsel güncelleme
      const element = document.querySelector(`[data-appointment-id="${resizingAppointment.id}"]`) as HTMLDivElement;
      if (element) {
        const newHeight = Math.ceil(newDuration / 15) * quarterHeight;
        element.style.height = `${newHeight}px`;
        element.style.transition = 'height 0.1s ease-out';

        // Saat bilgisini güncelle
        const timeElement = element.querySelector('[data-appointment-time]');
        if (timeElement) {
          const formattedStartTime = format(resizingAppointment.startTime, 'HH:mm');
          const formattedEndTime = format(newEndTime, 'HH:mm');
          timeElement.textContent = `${formattedStartTime} - ${formattedEndTime}`;
        }
      }

      setResizingAppointment(prev => prev ? {
        ...prev,
        endTime: newEndTime,
        currentDuration: newDuration
      } : null);
    });
  };

  // Resize bitirme fonksiyonu
  const handleResizeEnd = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!resizingAppointment) return;

    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    const [appointmentId, serviceId] = resizingAppointment.id.split('-');
    const appointment = appointments.find((app: Appointment) => app.id === appointmentId);
    if (!appointment) return;

    try {
      // Calculate new duration (round to 15-minute segments)
      const deltaY = e.clientY - resizingAppointment.startY;
      const deltaQuarters = Math.round(deltaY / quarterHeight);
      const deltaMinutes = deltaQuarters * 15;
      const newDuration = Math.max(15, resizingAppointment.currentDuration + deltaMinutes);

      // Get start time and calculate new end time
      const startTime = parseISO(appointment.startTime);
      const endTime = addMinutes(startTime, newDuration);

      // Update appointment
      const updatedAppointment = {
        ...appointment,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      };

      // Update API
      const result = await updateAppointment(updatedAppointment);
      
      if (!result) {
        throw new Error('Update failed');
      }

      toast.success('Appointment duration updated');

    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error updating appointment duration');
      
      // In case of error, return to original height
      const element = document.querySelector(`[data-appointment-id="${resizingAppointment.id}"]`) as HTMLDivElement;
      if (element) {
        element.style.height = `${resizingAppointment.initialHeight}px`;
      }
    } finally {
      setResizingAppointment(null);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleTodayClick}
              >
                Today
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateNavigation("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="min-w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "MMMM yyyy", { locale: enUS })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && onDateChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDateNavigation("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                    <Search className="h-4 w-4" />
                    {searchQuery && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search customer, service or phone..."
                        className="flex-1 text-sm bg-transparent outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {renderSearchResults()}
                  </div>
                </PopoverContent>
              </Popover>
              <SettingsMenu onOpenQuickModal={() => handleOpenModal('quick')} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ignore-working-hours"
                checked={ignoreWorkingHours}
                onCheckedChange={setIgnoreWorkingHours}
              />
              <label htmlFor="ignore-working-hours" className="text-sm font-medium">
                Ignore working hours
              </label>
            </div>

            <Button onClick={() => handleOpenModal('create')}>
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>
        </header>

        {/* Takvim Grid'i */}
        <div className="flex-1 overflow-hidden relative">
          {/* Scroll Okları */}
          <div className="sticky top-[72px] left-0 right-0 pointer-events-none z-30">
            <div className="absolute left-[100px] top-1/2 -translate-y-1/2 w-10 h-20 bg-gradient-to-r to-transparent flex items-center justify-center pointer-events-auto">
              <button 
                onClick={() => handleArrowScroll('left')}
                className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-gradient-to-l to-transparent flex items-center justify-center pointer-events-auto">
              <button 
                onClick={() => handleArrowScroll('right')}
                className="w-8 h-8 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="h-full flex">
            {/* Fixed Time Column */}
            <div className="w-[100px] flex-shrink-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
              <div className="h-[72px] flex items-center justify-center">
                <div className="text-xs font-medium text-gray-500"></div>
              </div>
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot.display} className="h-32 flex items-start justify-center relative">
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex flex-col items-center">
                      <div className="text-base font-medium text-gray-700">{timeSlot.time}</div>
                      <div className="text-[10px] font-medium text-gray-400 tracking-wider">{timeSlot.period}</div>
                    </div>
                    <div className="h-[1px] w-6 bg-blue-400 translate-y-[-8px]" />
                  </div>
                  <div className="absolute right-0 top-0 w-[2px] h-full bg-gray-100" />
                </div>
              ))}
            </div>

            {/* Scrollable Content */}
            <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
              {/* Days Header */}
              <div ref={headerRef} className="sticky top-0 bg-white z-20">
                <div className="grid grid-cols-[repeat(21,140px)] relative">
                  {extendedDays.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => onDateChange(day)}
                      className={cn(
                        "py-2 group hover:bg-gray-50 transition-colors",
                        isSameDay(day, selectedDate) && "relative"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-medium text-gray-500">
                          {format(day, "EEE", { locale: enUS })}
                        </div>
                        <div className={cn(
                          "mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium",
                          isSameDay(day, selectedDate) 
                            ? "bg-blue-500 text-white" 
                            : "text-gray-700 group-hover:bg-gray-100"
                        )}>
                          {format(day, "d", { locale: enUS })}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {format(day, "MMM", { locale: enUS })}
                        </div>
                      </div>
                      {isSameDay(day, selectedDate) && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Randevu Grid'i */}
              <DndContext 
                sensors={sensors} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
              >
                <div className="relative">
                  {timeSlots.map((timeSlot) => (
                    <div
                      key={timeSlot.display}
                      className="h-32 grid grid-cols-[repeat(21,140px)]"
                    >
                      {extendedDays.map((day) => {
                        const dayOpen = isDayOpen(day);
                        const timeSlotOpen = isTimeSlotOpen(day, timeSlot.display);
                        const cellId = `${format(day, "yyyy-MM-dd")}_${timeSlot.display}`;
                        
                        // Determine if this is a break time specifically
                        const isBreakTimeSlot = isBreakTime(day, timeSlot.display);
                        
                        return (
                          <DroppableCell
                            key={cellId}
                            id={cellId}
                            className={cn(
                              "border-r border-b border-gray-100 relative",
                              !dayOpen && !ignoreWorkingHours && "bg-gradient-to-br from-gray-100 to-gray-200 [background-size:10px_10px] [background-image:repeating-linear-gradient(45deg,#0000_0,#0000_5px,#f0f0f0_0,#f0f0f0_1px)]", // Closed day - striped pattern
                              dayOpen && isBreakTimeSlot && !ignoreWorkingHours && "bg-gradient-to-r from-amber-50 to-amber-100/30 border-l-2 border-l-amber-200", // Break time - amber tones
                              dayOpen && !timeSlotOpen && !isBreakTimeSlot && !ignoreWorkingHours && "bg-gradient-to-r from-red-50 to-red-100/30 border-l-2 border-l-red-200" // Outside working hours - red tones
                            )}
                            disabled={!ignoreWorkingHours && (!dayOpen || !timeSlotOpen)}
                          >
                            {/* Closed day indicator */}
                            {!dayOpen && !ignoreWorkingHours && (
                              <div className="absolute mt-10 inset-0 flex items-center justify-center opacity-70 pointer-events-none z-10">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="text-xs text-red-800 font-medium">Closed</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Break time indicator */}
                            {dayOpen && isBreakTimeSlot && !ignoreWorkingHours && (
                              <div className="absolute mt-10 inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <div className="flex flex-col items-center">
                                  <MoonStar size={16} className="text-amber-600 mb-1" />
                                  <div className="text-[10px] text-amber-800 font-medium">Break Time</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Outside working hours indicator */}
                            {dayOpen && !timeSlotOpen && !isBreakTimeSlot && !ignoreWorkingHours && (
                              <div className="absolute mt-10 inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <div className="flex flex-col items-center">
                                  <Clock size={16} className="text-red-600 mb-1" />
                                  <div className="text-[10px] text-red-800 font-medium">Closed</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Appointments for this cell */}
                            {getAppointmentsForDayAndTime(day, timeSlot.display).map((appointment: Appointment) => (
                              <div key={appointment.id}>
                                {appointment.appointmentServices.map((service: AppointmentService) => (
                                  <DraggableAppointment
                                    key={`${appointment.id}-${service.service.id}`}
                                    id={`${appointment.id}-${service.service.id}`}
                                    appointment={appointment}
                                    service={service}
                                    onClick={() => handleOpenModal('edit', appointment)}
                                    onResizeStart={(e) => handleResizeStart(e, appointment, service.service.id)}
                                    isResizable={true}
                                  />
                                ))}
                              </div>
                            ))}
                          </DroppableCell>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {createPortal(
                  <DragOverlay>
                    {activeAppointment && (
                      <div 
                        className="min-w-[100px] bg-white shadow-lg rounded-md p-3 border-l-4 border-blue-500 opacity-90"
                        style={{ maxWidth: '200px' }}
                      >
                        <div className="text-sm font-medium truncate">
                          {activeAppointment.customerName || 'No Name'}
                        </div>
                      </div>
                    )}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>
            </div>
          </div>
        </div>
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={modalType}
        selectedAppointment={selectedAppointment}
      />
    </>
  )
} 