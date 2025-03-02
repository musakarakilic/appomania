import { memo } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Service } from "@/types/service"

interface ServiceSelectionProps {
  services: Service[]
  selectedServices: string[]
  isLoadingServices: boolean
  onToggleService: (serviceId: string) => void
}

export const ServiceSelection = memo(function ServiceSelection({
  services,
  selectedServices,
  isLoadingServices,
  onToggleService
}: ServiceSelectionProps) {
  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">No services found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {services.map((service) => (
        <div
          key={service.id}
          className={cn(
            "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
            selectedServices.includes(service.id)
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50",
            !service.isActive && "opacity-50"
          )}
          onClick={() => service.isActive && onToggleService(service.id)}
        >
          <div className="flex flex-col">
            <span className="font-medium">{service.name}</span>
            <span className="text-sm text-muted-foreground">
              {service.duration} minutes
            </span>
            {service.description && (
              <span className="text-xs text-muted-foreground mt-1">
                {service.description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${service.price}</span>
            <div
              className={cn(
                "w-4 h-4 rounded-md border-2",
                selectedServices.includes(service.id)
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}) 