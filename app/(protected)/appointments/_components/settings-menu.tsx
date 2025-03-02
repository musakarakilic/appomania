"use client"

import { useRouter } from "next/navigation"
import { 
  Bell, 
  UserCog,
  Clock,
  Users
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings } from "lucide-react"
import { routes } from "@/routes"

export function SettingsMenu() {
  const router = useRouter()

  const menuItems = [
    {
      icon: Clock,
      label: "Working Hours",
      onClick: () => router.push(routes.settings.workingHours),
    },
    {
      icon: Users,
      label: "Services",
      onClick: () => router.push(routes.settings.services),
    },
    {
      icon: Bell,
      label: "Notification Settings",
      onClick: () => router.push(routes.settings.notifications),
    },
    {
      icon: UserCog,
      label: "Account Settings",
      onClick: () => router.push(routes.settings.account),
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Settings className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon className="h-4 w-4 text-gray-500" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 