import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  bgColor
}) => {
  return (
    <div className="flex items-center gap-4">
      {Icon && (
        <div className={cn("p-2 w-fit rounded-md", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      )}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}; 