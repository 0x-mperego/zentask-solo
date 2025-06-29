"use client"

import { PageLayout } from "@/components/page-layout"
import { GenericDataTable } from "@/components/generic-data-table"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { IconDotsVertical, IconEdit, IconEye, IconEyeOff, IconPlus, IconTrash } from "@tabler/icons-react"
import { type ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"


interface Utente {
  id: number
  nome: string
  cognome: string
  avatar?: string
  email: string
  ruolo: "admin" | "operatore"
  password: string
}

const getInitials = (nome: string, cognome: string) => {
  return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase()
}

const createColumns = (
  handleEdit: (item: Utente) => void,
  handleDelete: (id: number) => void
): ColumnDef<Utente>[] => [
  {
    accessorKey: "nome",
    header: "Utente",
    cell: ({ row }) => {
      const utente = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={utente.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(utente.nome, utente.cognome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {utente.nome} {utente.cognome}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "ruolo",
    header: "Ruolo",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.ruolo === "admin" ? "default" : "secondary"
        }
      >
        {row.original.ruolo === "admin"
          ? "Amministratore"
          : "Operatore"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const utente = row.original
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEdit(utente)}>
                <IconEdit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(utente.id)}
                className="text-destructive"
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export default function UtentiPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const isMobile = useIsMobile()
  const [utenti, setUtenti] = useState<Utente[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Utente | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    avatar: "",
    email: "",
    ruolo: "operatore" as "admin" | "operatore",
    password: "",
  })

  const loadUtenti = () => {
    const saved = localStorage.getItem("zentask_utenti")
    if (saved) {
      setUtenti(JSON.parse(saved))
    } else {
      const defaultUtenti = [
        {
          id: 1,
          nome: "Admin",
          cognome: "User",
          email: "admin@zentask.local",
          ruolo: "admin" as const,
          password: "admin123",
          avatar: "",
        },
        {
          id: 2,
          nome: "Mario",
          cognome: "Rossi",
          email: "mario.rossi@zentask.local",
          ruolo: "operatore" as const,
          password: "operatore123",
          avatar: "",
        },
      ]
      setUtenti(defaultUtenti)
      localStorage.setItem("zentask_utenti", JSON.stringify(defaultUtenti))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUtenti()
    }
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return null
  }

  const saveUtenti = (newUtenti: Utente[]) => {
    localStorage.setItem("zentask_utenti", JSON.stringify(newUtenti))
    setUtenti(newUtenti)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast.error("Il nome e obbligatorio")
      return
    }

    if (!formData.cognome.trim()) {
      toast.error("Il cognome e obbligatorio")
      return
    }

    if (!formData.email.trim()) {
      toast.error("L email e obbligatoria")
      return
    }

    if (!editingItem && !formData.password.trim()) {
      toast.error("La password e obbligatoria per nuovi utenti")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Formato email non valido")
      return
    }

    const emailExists = utenti.some(
      (user) =>
        user.email.toLowerCase() === formData.email.toLowerCase() &&
        (!editingItem || user.id !== editingItem.id)
    )
    if (emailExists) {
      toast.error("Esiste gia un utente con questa email")
      return
    }

    if (editingItem) {
      const updated = utenti.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              password: formData.password || item.password,
            }
          : item
      )
      saveUtenti(updated)
      toast.success("Utente aggiornato con successo")
    } else {
      const newId = Math.max(...utenti.map((u) => u.id), 0) + 1
      const newUtente = { id: newId, ...formData }
      saveUtenti([...utenti, newUtente])
      toast.success("Utente creato con successo")
    }

    setIsSheetOpen(false)
    setEditingItem(null)
    setFormData({
      nome: "",
      cognome: "",
      avatar: "",
      email: "",
      ruolo: "operatore",
      password: "",
    })
    setShowPassword(false)
  }

  const handleEdit = (item: Utente) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome,
      cognome: item.cognome,
      avatar: item.avatar || "",
      email: item.email,
      ruolo: item.ruolo,
      password: "",
    })
    setIsSheetOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo utente?")) {
      const filtered = utenti.filter((item) => item.id !== id)
      saveUtenti(filtered)
      toast.success("Utente eliminato con successo")
    }
  }

  const handleOpenSheet = () => {
    setEditingItem(null)
    setFormData({
      nome: "",
      cognome: "",
      avatar: "",
      email: "",
      ruolo: "operatore",
      password: "",
    })
    setIsSheetOpen(true)
  }

  const renderUtenteCard = (utente: Utente, onClick?: () => void) => (
    <Card 
      className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={utente.avatar} />
              <AvatarFallback className="text-sm">
                {getInitials(utente.nome, utente.cognome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none">
                  {utente.nome} {utente.cognome}
                </h3>
                <Badge
                  variant={utente.ruolo === "admin" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {utente.ruolo === "admin" ? "Amministratore" : "Operatore"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{utente.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground h-8 w-8"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(utente) }}>
                <IconEdit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); handleDelete(utente.id) }}
                className="text-destructive"
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete)

  const customActionButton = (
    <Button onClick={handleOpenSheet}>
      <IconPlus className="h-4 w-4 mr-2" />
      Nuovo Utente
    </Button>
  )

  return (
    <PageLayout
      title="Utenti"
      description="Gestisci gli utenti del sistema"
      isAdminPage={true}
      customActionButton={customActionButton}
    >
      <GenericDataTable
        data={utenti}
        columns={columns}
        showItemCount={false}
        mobileCardRender={renderUtenteCard}
        emptyStateTitle="Nessun utente presente"
        emptyStateDescription="Aggiungi il primo utente per iniziare a gestire il sistema."
        emptyStateAction={
          <Button 
            onClick={handleOpenSheet}
            className="mt-2"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Aggiungi primo utente
          </Button>
        }
      />

      {/* Form Sheet */}
      <StandardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingItem ? "Modifica Utente" : "Nuovo Utente"}
        description={editingItem
          ? "Modifica i dettagli dell'utente selezionato"
          : "Inserisci i dettagli del nuovo utente"}
        onSubmit={handleSubmit}
        onCancel={() => setIsSheetOpen(false)}
        submitText={editingItem ? "Salva Modifiche" : "Aggiungi Utente"}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome" htmlFor="nome" required>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              required
            />
          </FormField>
          
          <FormField label="Cognome" htmlFor="cognome" required>
            <Input
              id="cognome"
              value={formData.cognome}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cognome: e.target.value,
                }))
              }
              required
            />
          </FormField>
        </div>
        
        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </FormField>
        
        <FormField label="Ruolo" htmlFor="ruolo">
          <Select
            value={formData.ruolo}
            onValueChange={(value: "admin" | "operatore") =>
              setFormData((prev) => ({ ...prev, ruolo: value }))
            }
          >
            <SelectTrigger id="ruolo">
              <SelectValue placeholder="Seleziona un ruolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Amministratore</SelectItem>
              <SelectItem value="operatore">Operatore</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        
        <FormField 
          label="Password" 
          htmlFor="password" 
          description={editingItem ? "Lascia vuoto per non modificare" : undefined}
          required={!editingItem}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required={!editingItem}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  )
}
