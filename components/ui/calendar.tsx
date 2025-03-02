"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { tr, enUS } from "date-fns/locale"
import { 
  format, 
  addMonths, 
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from "date-fns"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
  appointmentDates?: Date[]
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  appointmentDates = []
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const appointmentDatesSet = new Set(appointmentDates.map(date => date.toDateString()))

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  // Week days
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className={cn("p-3 bg-white rounded-xl space-y-4", className)}>
      {/* Header and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: enUS })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Takvim Grid */}
      <div>
        {/* Haftanın Günleri */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const isSelected = selected && isSameDay(day, selected)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const hasAppointment = appointmentDatesSet.has(day.toDateString())
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelect?.(day)}
                disabled={!isCurrentMonth}
                className={cn(
                  "h-9 w-full relative rounded-lg text-sm font-medium",
                  "hover:bg-gray-100 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isToday(day) && !isSelected && "border-2 border-primary",
                  !isCurrentMonth && "text-gray-300"
                )}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>
                  {format(day, "d")}
                </time>
                {hasAppointment && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
} 