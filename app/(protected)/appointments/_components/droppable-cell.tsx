"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, useMemo } from "react"
import { format, parseISO, addMinutes } from "date-fns"
import { Plus } from "lucide-react"
import React from "react"
import { useWorkingHoursQuery } from "@/hooks/use-working-hours-query"

interface DroppableCellProps {
  id: string
  children?: React.ReactNode
  className?: string
  isSelectedDay?: boolean
  date?: Date
  onAddClick?: (time: string) => void
  disabled?: boolean
  disabledMessage?: string
}

// Çakışma kontrolü için yardımcı fonksiyon
const checkOverlap = (
  startTime: Date,
  duration: number,
  existingAppointments: React.ReactNode,
  skipAppointmentId?: string
) => {
  const endTime = addMinutes(startTime, duration)
  
  let hasOverlap = false
  React.Children.forEach(existingAppointments, (child) => {
    if (!React.isValidElement(child)) return
    
    // Props'ları kontrol et
    const props = child.props as any
    if (!props || !props['data-appointment-id'] || !props.startTime || !props.endTime) return
    
    const appointmentId = props['data-appointment-id'].split('-')[0]
    if (appointmentId === skipAppointmentId) return
    
    try {
      const appointmentStart = parseISO(props.startTime)
      const appointmentEnd = parseISO(props.endTime)
      
      if (
        (startTime < appointmentEnd && endTime > appointmentStart) &&
        !(startTime.getTime() === appointmentEnd.getTime() || endTime.getTime() === appointmentStart.getTime())
      ) {
        hasOverlap = true
      }
    } catch (error) {
      console.error('Error parsing appointment dates:', error)
      return
    }
  })
  
  return hasOverlap
}

export function DroppableCell({
  id,
  children,
  className,
  isSelectedDay,
  date,
  onAddClick,
  disabled = false,
  disabledMessage = "",
}: DroppableCellProps) {
  const { workingHours } = useWorkingHoursQuery();
  const { isOver, setNodeRef, active, rect: dropRect } = useDroppable({ 
    id,
    disabled
  })
  const [hoveredQuarter, setHoveredQuarter] = useState<number | null>(null)
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | "custom" | null>(null)
  const [activeQuarter, setActiveQuarter] = useState<number>(0)
  const cellRef = useRef<HTMLDivElement>(null)

  // Hücre yüksekliği (4 çeyrek = 1 saat = 128px)
  const cellHeight = 128

  // Sürükleme başladığında hover state'ini temizle
  useEffect(() => {
    if (active) {
      setHoveredQuarter(null)
    }
  }, [active])

  // Parse the date from the cell ID if date is not provided
  const [dateStr] = id.split('_')
  const cellDate = date || parseISO(dateStr)
  const dayOfWeek = date ? format(date, 'EEEE').toUpperCase() : format(cellDate, 'EEEE').toUpperCase();
  const currentHour = date ? format(date, 'HH:mm') : format(cellDate, 'HH:mm');
  
  const isWorkingHour = useMemo(() => {
    if (!workingHours || workingHours.length === 0) return false;
    
    const daySettings = workingHours.find(wh => wh.day === dayOfWeek);
    if (!daySettings || !daySettings.isOpen) return false;

    const timeInRange = (time: string, start: string, end: string) => {
      return time >= start && time <= end;
    };

    // İş saatleri kontrolü
    const isInWorkingHours = timeInRange(currentHour, daySettings.startTime, daySettings.endTime);
    
    // Mola saati kontrolü
    const isInBreakTime = timeInRange(currentHour, daySettings.breakStart, daySettings.breakEnd);

    return isInWorkingHours && !isInBreakTime;
  }, [workingHours, dayOfWeek, currentHour]);

  // Calculate time based on quarter
  const getTimeFromQuarter = (quarter: number) => {
    // ID'den saat bilgisini al (örn: 2024-03-20_09 -> 9. saat)
    const [_, hourStr] = id.split('_')
    const baseHour = parseInt(hourStr, 10)
    
    // Çeyrek saatten dakikayı hesapla (0 -> 0dk, 1 -> 15dk, 2 -> 30dk, 3 -> 45dk)
    const minute = (quarter % 4) * 15
    
    const timeDate = new Date(cellDate)
    timeDate.setHours(baseHour, minute, 0, 0)
    return format(timeDate, 'HH:mm')
  }

  const workingHour = workingHours.find(wh => wh.day.toLowerCase() === dayOfWeek)
  const hasAppointments = React.Children.count(children) > 0

  // Mouse hareketi ile kılavuz pozisyonunu güncelle
  const handleHoverMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cellRef.current || !active) return

    const rect = cellRef.current.getBoundingClientRect()
    const mouseY = e.clientY
    const cellTop = rect.top
    
    // Grip ikonunun konumunu al
    const gripOffset = active.data?.current?.gripOffset?.y || 0
    const appointmentHeight = active.data?.current?.height || 32
    const appointmentDuration = active.data?.current?.duration || 30
    
    // Mouse pozisyonundan grip offset'i çıkar
    const adjustedY = mouseY - gripOffset - cellTop
    
    // Hücre sınırları içinde tut
    const constrainedY = Math.max(0, Math.min(adjustedY, rect.height - appointmentHeight))
    
    // 15 dakikalık dilimlere snap et
    const quarterHeight = 32
    
    // Grip pozisyonuna göre en yakın çeyreği bul
    const rawQuarter = constrainedY / quarterHeight
    const nearestQuarters = [0, 1, 2, 3]
    
    // En yakın çeyreği bul
    let minDistance = Infinity
    let nearestQuarter = 0
    
    nearestQuarters.forEach(q => {
      const distance = Math.abs(rawQuarter - q)
      if (distance < minDistance) {
        minDistance = distance
        nearestQuarter = q
      }
    })
    
    // Snap eşiğini ayarla
    const snapThreshold = 0.35
    
    if (minDistance <= snapThreshold) {
      const [_, hourStr] = id.split('_')
      const baseHour = parseInt(hourStr, 10)
      const minute = nearestQuarter * 15
      
      const proposedStartTime = new Date(cellDate)
      proposedStartTime.setHours(baseHour, minute, 0, 0)
      
      const hasOverlap = checkOverlap(
        proposedStartTime,
        appointmentDuration,
        children,
        active.data?.current?.appointmentId
      )
      
      if (!hasOverlap) {
        setHoveredQuarter(nearestQuarter)
        setActiveQuarter(nearestQuarter)
        setDropPosition("custom")
      }
    }
  }

  // Sürükleme kılavuzunun stilini güncelle
  const guideStyle = {
    top: `${activeQuarter * 32}px`,
    height: active?.data?.current?.height || '30px'
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (node) {
          ;(cellRef as any).current = node
        }
      }}
      data-over-id={id}
      data-drop-position={dropPosition}
      data-active-quarter={activeQuarter}
      data-disabled={disabled}
      className={cn(
        "relative h-32",
        isOver && !disabled && "bg-blue-50/50",
        !isWorkingHour && "bg-gray-50/50",
        disabled && "bg-gray-100 cursor-not-allowed",
        hasAppointments && "overflow-visible",
        !hasAppointments && "overflow-hidden",
        className
      )}
      onClick={(e) => {
        if (disabled) return;
        if (!hasAppointments && !active) {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseY = e.clientY - rect.top;
          const quarterHeight = 32;
          const quarterIndex = Math.floor(mouseY / quarterHeight);
          onAddClick?.(id);
        }
      }}
      onMouseEnter={() => {
        if (disabled || !active) {
          setHoveredQuarter(null)
          setDropPosition(null)
        }
      }}
      onMouseMove={(e) => {
        if (disabled) return;
        handleHoverMouseMove(e);
      }}
      onMouseLeave={() => {
        setHoveredQuarter(null)
        setDropPosition(null)
      }}
    >
      {/* Disabled Overlay with Message */}
      {disabled && disabledMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-100/70">
          <div className="text-sm text-gray-500 px-4 py-2 bg-white/80 rounded-md shadow-sm border border-gray-200">
            {disabledMessage}
          </div>
        </div>
      )}

      {/* Grid Lines */}
      {/* Removing the grid lines div */}

      {/* Appointments Container */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover Overlay */}
      {!hasAppointments && !disabled && hoveredQuarter !== null && (
        <div
          className="absolute left-1 right-1 bg-blue-50 border border-blue-200 rounded-md pointer-events-none"
          style={{
            top: `${hoveredQuarter * 32 + 1}px`,
            height: '30px'
          }}
        />
      )}

      {/* Drop Overlay - Removing this since we'll use the guide for both */}
      {isOver && !children && dropPosition !== "custom" && (
        <div 
          className={cn(
            "absolute left-1 right-1 bg-blue-500/20 border-2 border-blue-500 rounded-md pointer-events-none transition-all duration-150",
            dropPosition === "top" ? "top-1" : "bottom-1"
          )}
          style={{
            height: active?.data?.current?.height || '30px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
              Buraya Bırak
            </div>
          </div>
        </div>
      )}

      {/* Sürükleme Kılavuzu */}
      {isOver && active && (
        <div 
          className="absolute left-0 right-0 border-2 border-dashed border-blue-400 bg-blue-50/30 pointer-events-none"
          style={guideStyle}
        >
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
            {getTimeFromQuarter(activeQuarter)}
          </div>
        </div>
      )}

      {/* Empty State Indicator */}
      {!hasAppointments && !hoveredQuarter && !isOver && (
        <div className="relative inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Randevu Ekle</span>
          </div>
        </div>
      )}
    </div>
  )
} 