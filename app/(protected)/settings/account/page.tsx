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
      toast.error("New password cannot be empty / Yeni şifre boş olamaz")
      return
    }

    if (!confirmPassword.trim()) {
      toast.error("Confirm password cannot be empty / Şifre onayı boş olamaz")
      return
    }

    if (hasPassword && !currentPassword.trim()) {
      toast.error("Current password cannot be empty / Mevcut şifre boş olamaz")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match / Yeni şifreler eşleşmiyor")
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
          ? "Two-factor authentication enabled / İki faktörlü doğrulama etkinleştirildi"
          : "Two-factor authentication disabled / İki faktörlü doğrulama devre dışı bırakıldı"
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
            <CardTitle>Profile Information / Profil Bilgileri</CardTitle>
            <CardDescription>
              Update your personal information / Kişisel bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Label>Full Name / İsim Soyisim</Label>
                </div>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name / İsim Soyisim"
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
                    Email cannot be changed for OAuth accounts / OAuth hesapları için email değiştirilemez
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isProfileSaving}>
                  {isProfileSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving... / Kaydediliyor...
                    </>
                  ) : (
                    "Save / Kaydet"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password / Şifre</CardTitle>
            <CardDescription>
              {hasPassword 
                ? "Change your password regularly for account security / Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin"
                : "Set up a password for your account / Hesabınız için bir şifre belirleyin"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isOAuthUser && !hasPassword && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're using {user?.provider} to sign in. Setting up a password will allow you to also sign in with email.
                    <br />
                    {user?.provider} ile giriş yapıyorsunuz. Şifre belirleyerek email ile de giriş yapabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {hasPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <Label>Current Password / Mevcut Şifre</Label>
                  </div>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password / Mevcut şifrenizi girin"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <Label>New Password / Yeni Şifre</Label>
                </div>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password / Yeni şifre girin"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <Label>Confirm Password / Şifreyi Onayla</Label>
                </div>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password / Yeni şifreyi onaylayın"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={isPasswordSaving}>
                  {isPasswordSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {hasPassword ? "Changing... / Değiştiriliyor..." : "Setting... / Ayarlanıyor..."}
                    </>
                  ) : (
                    hasPassword ? "Change Password / Şifreyi Değiştir" : "Set Password / Şifre Belirle"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security / Güvenlik</CardTitle>
            <CardDescription>
              Manage your account security settings / Hesap güvenlik ayarlarınızı yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label>Two Factor Authentication / İki Faktörlü Doğrulama</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security when signing in / Giriş yaparken ek güvenlik katmanı ekleyin
                </p>
              </div>
              <Switch
                checked={settings.isTwoFactorEnabled}
                onCheckedChange={handleTwoFactorChange}
                disabled={isTwoFactorSaving || (!hasPassword && !settings.isTwoFactorEnabled)}
              />
              {!hasPassword && !settings.isTwoFactorEnabled && (
                <p className="text-sm text-muted-foreground mt-2">
                  You must set a password before enabling two-factor authentication /
                  İki faktörlü doğrulamayı etkinleştirmek için önce bir şifre belirlemelisiniz
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 