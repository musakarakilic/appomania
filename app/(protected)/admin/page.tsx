"use client"

import { admin } from "@/actions/admin"
import { RoleGate } from "@/components/auth/role-gate"
import { FormSuccess } from "@/components/form-success"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"
import { toast } from "sonner"

const AdminPage = () => {
    const onServerActionClick = () => {
        admin()
        .then((data) => {
            if(data.error) {
                toast.error(data.error)
            }

            if(data.success) {
                toast.success(data.success)
            }
        })
    }

    const onApiRouteClick = () => {
        fetch("/api/admin")
        .then((response) => {
            if(response.ok) {
                toast.success("Allowed API Route")
            }else {
                toast.error("Forbidden API Route")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your application and view admin-only features.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border space-y-4">
                    <h3 className="font-medium">Access Control</h3>
                    <RoleGate allowedRole={UserRole.ADMIN}>
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <FormSuccess 
                                message="You have admin access to this content"
                            />
                        </div>
                    </RoleGate>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border space-y-6">
                    <h3 className="font-medium">Admin Actions</h3>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                                Admin API Route
                            </p>
                            <p className="text-xs text-slate-500">
                                Test the admin-only API endpoint
                            </p>
                        </div>
                        <Button
                            onClick={onApiRouteClick}
                            size="sm"
                            className="bg-black hover:bg-gray-900 text-white"
                        >
                            Test
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                                Admin Server Action
                            </p>
                            <p className="text-xs text-slate-500">
                                Test the admin-only server action
                            </p>
                        </div>
                        <Button
                            onClick={onServerActionClick}
                            size="sm"
                            className="bg-black hover:bg-gray-900 text-white"
                        >
                            Test
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPage