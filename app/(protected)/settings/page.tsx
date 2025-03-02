"use client"

import { logout } from "@/actions/logout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Settings } from "lucide-react";

const SettingsPage = () => {
    const user = useCurrentUser();

    const onClick = () => {
        logout();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-6 bg-white rounded-2xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-x-2">
                        <Settings className="w-4 h-4" />
                        <h3 className="font-medium">General Settings</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm text-slate-600">{user?.email}</p>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <p className="text-sm text-slate-600">{user?.name}</p>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <p className="text-sm text-slate-600 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage