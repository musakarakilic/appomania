"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { Card } from "@/components/ui/card"
import { 
  ShieldCheck, 
  Key, 
  UserCheck,
  Clock,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"

const DashboardPage = () => {
  const user = useCurrentUser()

  const stats = [
    {
      label: "Account Status",
      value: "Active",
      description: "Your account is in good standing",
      icon: ShieldCheck,
      color: "text-emerald-500"
    },
    {
      label: "2FA Status",
      value: user?.isTwoFactorEnabled ? "Enabled" : "Disabled",
      description: user?.isTwoFactorEnabled 
        ? "Two-factor authentication is active" 
        : "Enable 2FA for extra security",
      icon: Key,
      color: user?.isTwoFactorEnabled ? "text-emerald-500" : "text-amber-500"
    },
    {
      label: "Role",
      value: user?.role || "USER",
      description: "Your account permissions level",
      icon: UserCheck,
      color: "text-blue-500"
    },
    {
      label: "Last Login",
      value: "Just now",
      description: "Your most recent login activity",
      icon: Clock,
      color: "text-purple-500"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight ">
              Hoş Geldiniz, {user?.name}! 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Kontrol panelinize hoş geldiniz. İşte hesabınıza genel bir bakış.
            </p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 border shadow-sm">
            <div className="flex items-center gap-x-4">
              <div className={`p-2 rounded-full bg-slate-100 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border shadow-sm">
          <h3 className="font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-sm font-medium">Successful login</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
            <div className="flex items-center gap-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-sm font-medium">Profile updated</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border shadow-sm">
          <h3 className="font-medium mb-4">Security Tips</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-x-3 text-sm">
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              Enable two-factor authentication for enhanced security
            </div>
            <div className="flex items-center gap-x-3 text-sm">
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              Regularly update your password
            </div>
            <div className="flex items-center gap-x-3 text-sm">
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              Monitor your account activity
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage 