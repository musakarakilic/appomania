"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, Users, Clock, LayoutDashboard } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Appointments",
    icon: Calendar,
    href: "/appointments",
  },
  {
    label: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    children: [
      {
        label: "Working Hours",
        icon: Clock,
        href: "/settings/working-hours",
      },
      {
        label: "Account",
        icon: Users,
        href: "/settings/account",
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white border-r">
      {/* Logo Section */}
      <div className="p-6 border-b bg-white">
        <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Randevu
            </h1>
            <p className="text-xs text-blue-500/80">Appointment System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-2 p-4">
        {routes.map((route) => {
          const isActive = pathname === route.href || 
            (route.children?.some(child => pathname === child.href))

          return (
            <div key={route.href} className="relative">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-4 py-6 rounded-xl transition-all duration-200",
                  isActive && "bg-blue-500 text-white hover:bg-blue-600",
                  !isActive && "hover:bg-blue-50"
                )}
              >
                <Link href={route.href}>
                  <route.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-blue-500"
                  )} />
                  <span className="font-medium">{route.label}</span>
                </Link>
              </Button>

              {/* Sub Menu */}
              {isActive && route.children && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-blue-100 flex flex-col gap-1">
                  {route.children.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Button
                        key={child.href}
                        asChild
                        variant="ghost"
                        className={cn(
                          "justify-start gap-3 py-4 pl-4 rounded-lg transition-all duration-200",
                          isChildActive ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-gray-600"
                        )}
                      >
                        <Link href={child.href}>
                          <child.icon className={cn(
                            "h-4 w-4",
                            isChildActive ? "text-blue-600" : "text-gray-500"
                          )} />
                          <span className="font-medium">{child.label}</span>
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 