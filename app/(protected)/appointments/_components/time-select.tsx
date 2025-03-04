import { memo, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface TimeSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  ignoreWorkingHours?: boolean
}

// Çalışma saatleri içindeki zaman dilimleri
const workingTimeSlots = [
  ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
  ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
]

// Tüm gün için zaman dilimleri (30'ar dakika aralıklarla)
const allTimeSlots = [
  ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30"],
  ["03:00", "03:30", "04:00", "04:30", "05:00", "05:30"],
  ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30"],
  ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
  ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"],
  ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
  ["21:00", "21:30", "22:00", "22:30", "23:00", "23:30"]
]

export const TimeSelect = memo(function TimeSelect({
  value,
  onValueChange,
  disabled,
  ignoreWorkingHours = false
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev)
    }
  }, [disabled])

  const handleSelect = useCallback((time: string) => {
    onValueChange(time)
    setIsOpen(false)
  }, [onValueChange])

  // Kullanılacak zaman dilimlerini belirle
  const timeSlots = ignoreWorkingHours ? allTimeSlots : workingTimeSlots

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        {value || "Select time"}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white rounded-md border shadow-md">
          <div className="p-1 grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto">
            {timeSlots.flat().map((time) => (
              <Button
                key={time}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  value === time && "bg-primary/10 text-primary"
                )}
                onClick={() => handleSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}) 