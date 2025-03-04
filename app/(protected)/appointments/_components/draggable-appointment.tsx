"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, User, GripVertical } from "lucide-react"
import { useAppointmentsQuery } from "@/hooks/use-appointments-query"
import { useEffect, useState } from "react"
import { Appointment, AppointmentService } from "@/types/appointment"

interface DraggableAppointmentProps {
  id: string
  appointment: Appointment
  service: AppointmentService
  className?: string
  isDragging?: boolean
  onClick?: () => void
  onResizeStart?: (e: React.MouseEvent<Element, MouseEvent>) => void
  isResizable?: boolean
}

const defaultService = {
  name: "Unknown Service",
  id: "",
  duration: 0,
  price: 0
}

export function DraggableAppointment({
  id,
  appointment,
  service,
  className,
  isDragging,
  onClick,
  onResizeStart,
  isResizable = false
}: DraggableAppointmentProps) {
  const { isUpdating, isDeleting, deleteAppointment } = useAppointmentsQuery(new Date())
  const [isResizing, setIsResizing] = useState(false);
  
  // Debug için useEffect ekleyelim

  const start = parseISO(appointment.startTime)
  const end = parseISO(appointment.endTime)
  const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

  // Her 15 dakika için 32px yükseklik
  const quarterHeight = 32
  const heightInPixels = Math.ceil(durationInMinutes / 15) * quarterHeight
  const minimumHeight = 64 // En az 2 satır yükseklik (servis adı ve saat için)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isSortableDragging,
  } = useSortable({
    id,
    data: {
      height: Math.max(heightInPixels, minimumHeight),
      duration: durationInMinutes,
      appointmentId: id.split('-')[0],
      gripOffset: {
        y: 16 // Grip ikonunun dikey merkezi
      }
    }
  })

  const isDisabled = isUpdating || isDeleting

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? 'none' : 'transform 200ms ease-in-out',
    height: `${Math.max(heightInPixels, minimumHeight)}px`,
    position: 'relative' as const,
    zIndex: isSortableDragging ? 50 : 'auto',
    touchAction: 'none', // Touch cihazlar için önemli
  }

  const formatCustomerName = (name: string) => {
    if (!name) return "No Name";
    const names = name.split(' ')
    if (names.length === 1) return name
    return `${names[0]} ${names[names.length - 1]}`
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    return `**** ${phone.slice(-4)}`
  }

  const serviceColor = service.service.color || "#1E88E5"; // Default blue color
  const serviceName = service.service.name || "Unknown Service";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    
    if (window.confirm(`${appointment.customerName} Are you sure you want to delete this appointment?`)) {
      try {
        await deleteAppointment(appointment.id);
      } catch (error) {
        console.error("While deleting appointment, an error occurred:", error);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    onClick?.();
  };

  const handleResizeStartInternal = (e: React.MouseEvent) => {
    setIsResizing(true);
    if (onResizeStart) {
      onResizeStart(e);
    }
    
    // Add event listener to detect when resize ends
    const handleResizeEnd = () => {
      setTimeout(() => {
        setIsResizing(false);
      }, 200);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
    
    window.addEventListener('mouseup', handleResizeEnd);
  };

  const handleAppointmentClick = () => {
    if (isResizing) return;
    onClick?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-appointment-id={id}
      data-duration={durationInMinutes}
      className={cn(
        "relative group rounded-lg shadow-sm hover:shadow-lg overflow-visible",
        isDragging && "opacity-50 shadow-xl ring-2 ring-white",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleAppointmentClick}
      {...attributes}
      {...listeners}
    >
      {/* Background Color */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: serviceColor,
        }}
      />

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-lg"
      />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col min-h-[64px]">
        {/* Top Content */}
        <div className="flex-1 p-2">
          {/* Header - Service Name and Action Buttons */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            {/* Service Name with Drag Handle */}
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="cursor-grab active:cursor-grabbing hover:bg-white/20 rounded-md p-1"
                {...listeners}
                {...attributes}
              >
                <GripVertical className="h-4 w-4 text-white shadow-sm" />
              </div>
              <div className="w-2 h-2 flex-shrink-0 rounded-full bg-white shadow-sm" />
              <div className="font-medium text-sm truncate text-white shadow-sm">
                {serviceName}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleEdit}
                className="p-1 rounded-md hover:bg-white/20 text-white"
                disabled={isDisabled}
                title="Düzenle"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-1 rounded-md hover:bg-white/20 text-white"
                disabled={isDisabled}
                title="Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Customer Info */}
          {heightInPixels >= 96 && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 flex-shrink-0 text-white/90 shadow-sm" />
              <div className="text-sm text-white truncate shadow-sm">
                {formatCustomerName(appointment.customerName)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar - Time */}
        <div 
          className="flex items-center h-7 px-2 py-1 border-t border-white/20 rounded-b-lg"
          onMouseEnter={() => console.log('Mouse Enter: Bottom Bar')}
        >
          <div 
            className="text-[11px] text-white font-medium tracking-wide shadow-sm flex-1"
            data-appointment-time
          >
            {format(start, "HH:mm")} - {format(end, "HH:mm")}
          </div>
          
          {/* Resize Handle - In bottom bar */}
          {isResizable && (
            <div className="relative flex items-center z-50">
              {/* Outer container with no pointer events */}
              <div 
                className="absolute inset-0 -top-4 -bottom-4 -right-3 -left-2 z-50"
                style={{ pointerEvents: 'none' }}
              >
                {/* Inner container that handles events */}
                <div 
                  className="w-full h-full cursor-ns-resize"
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    console.log('MouseDown Event Start');
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeStartInternal(e);
                  }}
                />
              </div>
              
              {/* Visual handle */}
              <div className="w-6 h-5 hover:bg-white/20 active:bg-white/30 rounded flex items-center justify-center transition-colors pointer-events-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-0.5 bg-white/80 rounded-full group-hover:bg-white" />
                  <div className="w-2.5 h-0.5 bg-white/80 rounded-full group-hover:bg-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 