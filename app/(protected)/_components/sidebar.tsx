"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@/components/auth/user-button"
import { useCurrentRole } from "@/hooks/use-current-role"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useUserQuery } from "@/hooks/use-user-query"
import { UserRole } from "@prisma/client"
import { 
  Calendar,
  Settings,
  Users,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { logout } from "@/actions/logout"
import { Button } from "@/components/ui/button"
import { SidebarItem } from "./sidebar-item"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface RouteItem {
  icon: typeof Settings | typeof Calendar | typeof Users;
  label: string;
  href: string;
  hasLightning?: boolean;
}

const mainRoutes: RouteItem[] = [
  {
    icon: Calendar,
    label: "Appointments",
    href: "/appointments",
  },
]

const appointmentRoutes: RouteItem[] = [
  {
    icon: Settings,
    label: "Working Hours",
    href: "/settings/working-hours",
  },
  {
    icon: Users,
    label: "Services",
    href: "/settings/services",
  },
]

const settingsRoutes: RouteItem[] = [

  {
    icon: Users,
    label: "Account Settings",
    href: "/settings/account",
  },
]

const adminRoutes: RouteItem[] = [
  {
    icon: Users,
    label: "Admin",
    href: "/admin",
  },
]

const Sidebar = () => {
  const pathname = usePathname()
  const role = useCurrentRole()
  const user = useCurrentUser()
  const { settings } = useUserQuery()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  // Load the initial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save state changes to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const routes = [
    ...mainRoutes,
    ...appointmentRoutes,
    ...settingsRoutes,
    ...(role === UserRole.ADMIN ? adminRoutes : []),
  ]

  return (
    <div className={cn(
      "relative space-y-4 flex flex-col h-full bg-white border-r shadow-sm transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[280px]"
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-50 rounded-full bg-white border shadow-md hover:bg-gray-100"
        onClick={toggleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Logo */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-x-3 group"
        >
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl ring-1 ring-white/20">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white">
                Randevu
              </span>
              <span className="text-xs text-blue-100">
                Appointment System
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <SidebarItem
              key={route.href}
              icon={route.icon}
              label={route.label}
              href={route.href}
              isCollapsed={isCollapsed}
              hasLightning={route.hasLightning}
            />
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t bg-gradient-to-b from-gray-50 to-white">
        <div 
          className="p-4 flex items-center gap-x-3 cursor-pointer hover:bg-blue-50/50 transition-colors"
          onClick={() => router.push("/settings/account")}
        >
          <UserButton showLogout={false} />
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium line-clamp-1">{settings?.name || user?.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{settings?.email || user?.email}</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 pt-0">
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 mb-2",
                isCollapsed && "px-2"
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              {!isCollapsed && "Main Page"}
            </Button>
          </Link>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-medium text-red-600 hover:text-red-700 hover:bg-red-50/50",
              isCollapsed && "px-2"
            )}
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 