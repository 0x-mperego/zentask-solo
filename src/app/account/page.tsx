"use client"

import { PageLayout } from "@/components/page-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import { IconUpload, IconX, IconEye, IconEyeOff } from "@tabler/icons-react"
import React, { useState, useRef } from "react"
import { toast } from "sonner"

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateUser, changePassword } =
    useAuth()
  const { userAvatar, updateUserAvatar } = useSettings()

  const [tempFormData, setTempFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  // Update form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setTempFormData({
        nome: user.firstName || "",
        cognome: user.lastName || "",
        email: user.email || "",
      })
    }
  }, [user])

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Il file deve essere inferiore a 2MB")
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Il file deve essere un'immagine")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateUserAvatar(result)
        toast.success("Avatar aggiornato con successo!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    updateUserAvatar("/avatars/admin.jpg") // Reset to default
    toast.success("Avatar rimosso con successo!")
  }

  const handleSaveProfile = () => {
    if (
      !tempFormData.nome.trim() ||
      !tempFormData.cognome.trim() ||
      !tempFormData.email.trim()
    ) {
      toast.error("Compila tutti i campi richiesti.")
      return
    }

    if (!tempFormData.email.includes("@")) {
      toast.error("Inserisci un indirizzo email valido.")
      return
    }

    updateUser({
      firstName: tempFormData.nome.trim(),
      lastName: tempFormData.cognome.trim(),
      email: tempFormData.email.trim(),
    })

    toast.success("Profilo aggiornato con successo!")
  }

  const handleChangePassword = () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Compila tutti i campi della password.")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Le nuove password non corrispondono.")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La nuova password deve essere lunga almeno 6 caratteri.")
      return
    }

    const success = changePassword(
      passwordData.oldPassword,
      passwordData.newPassword
    )

    if (success) {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast.success("Password modificata con successo!")
    } else {
      toast.error("La password attuale non è corretta.")
    }
  }

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <PageLayout
      title="Account"
      description="Gestisci le informazioni del tuo profilo personale"
      isAdminPage={false}
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informazioni Profilo</CardTitle>
          <CardDescription>
            Aggiorna le tue informazioni personali e la foto del profilo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="space-y-2">
            <Label>Avatar Utente</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-lg">
                <AvatarImage src={userAvatar} alt="Avatar utente" className="rounded-lg" />
                <AvatarFallback className="text-lg rounded-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  {userAvatar && userAvatar !== "/avatars/admin.jpg" ? "Cambia Avatar" : "Carica Avatar"}
                </Button>
                {userAvatar && userAvatar !== "/avatars/admin.jpg" && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAvatar}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Rimuovi
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              L'avatar apparirà nella sidebar e nelle pagine. Dimensione massima: 2MB.
            </p>
          </div>

          {/* Nome e Cognome */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={tempFormData.nome}
                onChange={(e) => setTempFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Inserisci il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                id="cognome"
                value={tempFormData.cognome}
                onChange={(e) => setTempFormData(prev => ({ ...prev, cognome: e.target.value }))}
                placeholder="Inserisci il tuo cognome"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={tempFormData.email}
              onChange={(e) => setTempFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Inserisci la tua email"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              L'email viene utilizzata per l'accesso al sistema.
            </p>
          </div>

          {/* Pulsante Salva Profilo */}
          <div className="pt-4">
            <Button onClick={handleSaveProfile} className="w-auto">
              Salva Profilo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Cambio Password */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cambia Password</CardTitle>
          <CardDescription>
            Aggiorna la tua password per mantenere sicuro il tuo account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Attuale */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Password Attuale</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showPasswords.old ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Inserisci la password attuale"
                className="max-w-md pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("old")}
              >
                {showPasswords.old ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Nuova Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nuova Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Inserisci la nuova password"
                className="max-w-md pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              La password deve essere lunga almeno 6 caratteri.
            </p>
          </div>

          {/* Conferma Nuova Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Conferma la nuova password"
                className="max-w-md pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Pulsante Cambia Password */}
          <div className="pt-4">
            <Button onClick={handleChangePassword} className="w-auto">
              Cambia Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
