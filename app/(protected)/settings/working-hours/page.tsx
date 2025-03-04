"use client"

import { useState } from "react"
import { useWorkingHoursQuery } from "@/hooks/use-working-hours-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TimeSelect } from "@/components/time-select"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

const DAYS = [
  { id: "MONDAY", label: "Monday" },
  { id: "TUESDAY", label: "Tuesday" },
  { id: "WEDNESDAY", label: "Wednesday" },
  { id: "THURSDAY", label: "Thursday" },
  { id: "FRIDAY", label: "Friday" },
  { id: "SATURDAY", label: "Saturday" },
  { id: "SUNDAY", label: "Sunday" }
]

export default function WorkingHoursPage() {
  const { workingHours, isLoading, createDefaultWorkingHours } = useWorkingHoursQuery()
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours)

  const handleIsOpenChange = (day: string, isOpen: boolean) => {
    setLocalWorkingHours(prev => 
      prev.map(wh => wh.day === day ? { ...wh, isOpen } : wh)
    )
  }

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd', value: string) => {
    setLocalWorkingHours(prev => 
      prev.map(wh => wh.day === day ? { ...wh, [field]: value } : wh)
    )
  }

  const handleSave = async () => {
    try {
      // API'ye kaydet
      const response = await fetch("/api/settings/working-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workingHours: localWorkingHours }),
      })

      if (!response.ok) {
        throw new Error("Failed to save working hours")
      }

      toast.success("Working hours saved successfully")
    } catch (error) {
      console.error("Error saving working hours:", error)
      toast.error("An error occurred while saving working hours")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!localWorkingHours || localWorkingHours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">No working hours set yet</p>
        <Button onClick={() => createDefaultWorkingHours()}>
          Create Default Working Hours
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Working Hours</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
        <div className="flex gap-2 items-center text-amber-800">
          <AlertCircle size={18} />
          <p className="text-sm">Days marked as &quot;Closed&quot; will not be available for appointments in the booking system.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {DAYS.map((day) => {
          const daySettings = localWorkingHours.find(wh => wh.day === day.id)
          if (!daySettings) return null

          return (
            <Card 
              key={day.id} 
              className={`p-6 ${!daySettings.isOpen ? 'border-dashed border-gray-300 bg-gray-50' : ''}`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${!daySettings.isOpen ? 'text-gray-500' : ''}`}>{day.label}</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day.id}-switch`} className={!daySettings.isOpen ? 'text-gray-500' : ''}>
                      {daySettings.isOpen ? "Open" : "Closed"}
                    </Label>
                    <Switch
                      id={`${day.id}-switch`}
                      checked={daySettings.isOpen}
                      onCheckedChange={(checked) => handleIsOpenChange(day.id, checked)}
                    />
                  </div>
                </div>

                {daySettings.isOpen && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Working Hours</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start</Label>
                          <TimeSelect
                            value={daySettings.startTime}
                            onValueChange={(value) => handleTimeChange(day.id, 'startTime', value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End</Label>
                          <TimeSelect
                            value={daySettings.endTime}
                            onValueChange={(value) => handleTimeChange(day.id, 'endTime', value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Break Hours</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start</Label>
                          <TimeSelect
                            value={daySettings.breakStart}
                            onValueChange={(value) => handleTimeChange(day.id, 'breakStart', value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End</Label>
                          <TimeSelect
                            value={daySettings.breakEnd}
                            onValueChange={(value) => handleTimeChange(day.id, 'breakEnd', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!daySettings.isOpen && (
                  <div className="text-gray-500 text-sm italic">
                    This day is marked as closed and will not be available for appointments
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 