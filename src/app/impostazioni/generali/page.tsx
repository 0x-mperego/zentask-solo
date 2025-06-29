"use client"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/contexts/SettingsContext"
import { IconUpload, IconX } from "@tabler/icons-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { 
    companyName, 
    updateCompanyName, 
    companyDescription, 
    updateCompanyDescription,
    companyLogo,
    updateCompanyLogo 
  } = useSettings()
  
  const [tempCompanyName, setTempCompanyName] = useState(companyName)
  const [tempCompanyDescription, setTempCompanyDescription] = useState(companyDescription)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveAll = () => {
    updateCompanyName(tempCompanyName)
    updateCompanyDescription(tempCompanyDescription)
    toast.success("Impostazioni salvate con successo!")
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        updateCompanyLogo(result)
        toast.success("Logo aggiornato con successo!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    updateCompanyLogo(null)
    toast.success("Logo rimosso con successo!")
  }

  return (
    <PageLayout
      title="Generali"
      description="Personalizza le impostazioni del workspace e del profilo"
      isAdminPage={true}
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Impostazioni Azienda</CardTitle>
          <CardDescription>
            Gestisci le informazioni aziendali e le impostazioni del workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Azienda */}
          <div className="space-y-2">
            <Label>Logo Azienda</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Logo azienda"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <IconUpload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  {companyLogo ? "Cambia Logo" : "Carica Logo"}
                </Button>
                {companyLogo && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveLogo}
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
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Il logo apparirà nella sidebar e nelle pagine di login. Dimensione massima: 2MB.
            </p>
          </div>

          {/* Nome Azienda */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome Azienda</Label>
            <Input
              id="companyName"
              value={tempCompanyName}
              onChange={(e) => setTempCompanyName(e.target.value)}
              placeholder="Inserisci il nome della tua azienda"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Questo nome apparirà nel workspace e nei documenti.
            </p>
          </div>

          {/* Descrizione Azienda */}
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Descrizione</Label>
            <Input
              id="companyDescription"
              value={tempCompanyDescription}
              onChange={(e) => setTempCompanyDescription(e.target.value)}
              placeholder="Inserisci una breve descrizione (es. Gestione Interventi)"
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Questa descrizione apparirà sotto il nome azienda nella sidebar.
            </p>
          </div>

          {/* Pulsante Salva */}
          <div className="pt-4">
            <Button onClick={handleSaveAll} className="w-auto">
              Salva Modifiche
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
} 