import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export const AppointmentCard = ({ appointment, onClick }: AppointmentCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{appointment.customerName}</h3>
            <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
            <div className="mt-2">
              {appointment.appointmentServices.map((as) => (
                <span 
                  key={as.service.id}
                  className="inline-block bg-primary/10 text-primary text-sm rounded px-2 py-1 mr-2 mb-2"
                >
                  {as.service.name}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {format(new Date(appointment.startTime), "HH:mm", { locale: tr })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.endTime), "HH:mm", { locale: tr })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 