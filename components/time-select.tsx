import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
]

interface TimeSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function TimeSelect({
  value,
  onValueChange,
  disabled
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

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={handleToggle}
        disabled={disabled}
      >
        {value || "Saat seç"}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white rounded-md border shadow-md">
          <div className="p-1 grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant="ghost"
                className="justify-start font-normal"
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
} 