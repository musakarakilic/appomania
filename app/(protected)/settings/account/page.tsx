"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, KeyRound, Mail, User, Shield, AlertCircle } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserQuery } from "@/hooks/use-user-query"

interface AccountSettings {
  id?: string
  name: string
  email: string
  isTwoFactorEnabled: boolean
}

export default function AccountPage() {
  const user = useCurrentUser()
  const { settings: serverSettings, updateSettings, isLoading: isSettingsLoading, error } = useUserQuery()
  const [settings, setSettings] = useState<AccountSettings>({
    name: "",
    email: "",
    isTwoFactorEnabled: false
  })
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [isTwoFactorSaving, setIsTwoFactorSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [hasPassword, setHasPassword] = useState(false)

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings)
    }
    checkPasswordStatus()
  }, [serverSettings])

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch("/api/settings/account/password-status")
      if (!response.ok) throw new Error("Failed to check password status")
      const data = await response.json()
      setHasPassword(data.hasPassword)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSave = async () => {
    try {
      setIsProfileSaving(true)
      
      await updateSettings({
        name: settings.name,
        email: settings.email
      })

      toast.success("Account settings saved successfully")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "An error occurred while saving account settings")
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      toast.error("New password cannot be empty")
      return
    }

    if (!confirmPassword.trim()) {
      toast.error("Confirm password cannot be empty")
      return
    }

    if (hasPassword && !currentPassword.trim()) {
      toast.error("Current password cannot be empty")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    try {
      setIsPasswordSaving(true)
      const response = await fetch("/api/settings/account/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : null,
          newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to change password")
      }

      toast.success(hasPassword ? "Password changed successfully" : "Password set successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setHasPassword(true)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "An error occurred while changing password")
    } finally {
      setIsPasswordSaving(false)
    }
  }

  const handleTwoFactorChange = async (checked: boolean) => {
    try {
      setIsTwoFactorSaving(true)
      const response = await fetch("/api/settings/two-factor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: checked }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update two-factor authentication")
      }

      setSettings(prev => ({ ...prev, isTwoFactorEnabled: checked }))
      toast.success(
        checked 
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled"
      )
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "An error occurred while updating two-factor authentication")
      setSettings(prev => ({ ...prev, isTwoFactorEnabled: !checked }))
    } finally {
      setIsTwoFactorSaving(false)
    }
  }

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p>Error loading settings: {error.message}</p>
      </div>
    )
  }

  const isOAuthUser = user?.isOAuth

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Label>Full Name</Label>
                </div>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Label>Email</Label>
                </div>
                <Input
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                  readOnly
                />
                {isOAuthUser && (
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed for OAuth accounts
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isProfileSaving}>
                  {isProfileSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              {hasPassword 
                ? "Change your password regularly for account security"
                : "Set up a password for your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isOAuthUser && !hasPassword && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You&apos;re using {user?.provider} to sign in. Setting up a password will allow you to also sign in with email.
                  </AlertDescription>
                </Alert>
              )}

              {hasPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <Label>Current Password</Label>
                  </div>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <Label>New Password</Label>
                </div>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <Label>Confirm Password</Label>
                </div>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={isPasswordSaving}>
                  {isPasswordSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {hasPassword ? "Changing..." : "Setting..."}
                    </>
                  ) : (
                    hasPassword ? "Change Password" : "Set Password"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label>Two Factor Authentication</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security when signing in
                </p>
              </div>
              <Switch
                checked={settings.isTwoFactorEnabled}
                onCheckedChange={handleTwoFactorChange}
                disabled={isTwoFactorSaving || (!hasPassword && !settings.isTwoFactorEnabled)}
              />
              {!hasPassword && !settings.isTwoFactorEnabled && (
                <p className="text-sm text-muted-foreground mt-2">
                  You must set a password before enabling two-factor authentication
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 