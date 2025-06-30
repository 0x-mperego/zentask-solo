"use client"

import { useState } from "react"
import { GenericDataTable } from "@/components/generic-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/kibo-ui/pill"
import { Plus } from "lucide-react"
import { ColorPicker } from "@/components/color-picker"
import { toast } from "sonner"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

interface Attivita {
  id: number
  nome: string
  categoria: string
}

interface Categoria {
  id: string
  nome: string
  colore: string
}

const CATEGORIE_DEFAULT: Categoria[] = [
  { id: "LAB", nome: "Laboratorio", colore: "#ef4444" },
  { id: "COM", nome: "Commerciale", colore: "#22c55e" },
  { id: "WEB", nome: "Sviluppo Web", colore: "#3b82f6" },
]

const ATTIVITA_DEFAULT: Attivita[] = [
  { id: 1, nome: "Installazione Software", categoria: "LAB" },
  { id: 2, nome: "Riparazione Hardware", categoria: "LAB" },
  { id: 3, nome: "Consulenza", categoria: "COM" },
  { id: 4, nome: "Preventivo", categoria: "COM" },
  { id: 5, nome: "Sviluppo Sito Web", categoria: "WEB" },
  { id: 6, nome: "Manutenzione Sito", categoria: "WEB" },
]

function createAttivitaColumns(
  categorie: Categoria[],
  onEdit: (attivita: Attivita) => void,
  onDelete: (id: number) => void
): ColumnDef<Attivita>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome Attività",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nome")}</div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => {
        const categoriaId = row.getValue("categoria") as string
        const categoria = categorie.find(c => c.id === categoriaId)
        if (!categoria) {
          return (
            <Pill variant="outline" className="text-xs bg-transparent border-transparent">
              Sconosciuto
            </Pill>
          )
        }
        return (
          <Pill
            variant="outline"
            className="text-xs bg-transparent border-transparent"
          >
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: categoria.colore }}
            />
            <span style={{ color: categoria.colore }}>
              {categoria.id}: {categoria.nome}
            </span>
          </Pill>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const attivita = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(attivita)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(attivita.id)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function AttivitaPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [attivita, setAttivita] = useState<Attivita[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>([])
  
  // Activity states
  const [isAddAttivitaSheetOpen, setIsAddAttivitaSheetOpen] = useState(false)
  const [isEditAttivitaSheetOpen, setIsEditAttivitaSheetOpen] = useState(false)
  const [editingAttivita, setEditingAttivita] = useState<Attivita | null>(null)
  const [formAttivitaNome, setFormAttivitaNome] = useState("")
  const [formAttivitaCategoria, setFormAttivitaCategoria] = useState("")

  const loadCategorie = () => {
    const saved = localStorage.getItem("zentask_categorie_v2")
    if (saved) {
      try {
        setCategorie(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading categorie:", error)
        setCategorie(CATEGORIE_DEFAULT)
        localStorage.setItem("zentask_categorie_v2", JSON.stringify(CATEGORIE_DEFAULT))
      }
    } else {
      setCategorie(CATEGORIE_DEFAULT)
      localStorage.setItem("zentask_categorie_v2", JSON.stringify(CATEGORIE_DEFAULT))
    }
  }

  const loadAttivita = () => {
    const saved = localStorage.getItem("zentask_attivita_v2")
    if (saved) {
      try {
        setAttivita(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading attivita:", error)
        setAttivita(ATTIVITA_DEFAULT)
        localStorage.setItem("zentask_attivita_v2", JSON.stringify(ATTIVITA_DEFAULT))
      }
    } else {
      setAttivita(ATTIVITA_DEFAULT)
      localStorage.setItem("zentask_attivita_v2", JSON.stringify(ATTIVITA_DEFAULT))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadCategorie()
      loadAttivita()
    }
  }, [isAuthenticated])

  const saveAttivita = (newAttivita: Attivita[]) => {
    setAttivita(newAttivita)
    localStorage.setItem("zentask_attivita_v2", JSON.stringify(newAttivita))
  }

  const saveCategorie = (newCategorie: Categoria[]) => {
    setCategorie(newCategorie)
    localStorage.setItem("zentask_categorie_v2", JSON.stringify(newCategorie))
  }

  // Activity handlers
  const handleAddAttivita = () => {
    if (!formAttivitaNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }
    if (!formAttivitaCategoria) {
      toast.error("La categoria è obbligatoria")
      return
    }

    const newAttivita: Attivita = {
      id: Date.now(),
      nome: formAttivitaNome.trim(),
      categoria: formAttivitaCategoria,
    }

    saveAttivita([...attivita, newAttivita])
    setFormAttivitaNome("")
    setFormAttivitaCategoria("")
    setIsAddAttivitaSheetOpen(false)
    toast.success("Attività creata con successo")
  }

  const handleEditAttivita = (attivita: Attivita) => {
    setEditingAttivita(attivita)
    setFormAttivitaNome(attivita.nome)
    setFormAttivitaCategoria(attivita.categoria)
    setIsEditAttivitaSheetOpen(true)
  }

  const handleUpdateAttivita = () => {
    if (!formAttivitaNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }
    if (!formAttivitaCategoria) {
      toast.error("La categoria è obbligatoria")
      return
    }

    if (!editingAttivita) return

    const updated = attivita.map((item) =>
      item.id === editingAttivita.id
        ? { ...item, nome: formAttivitaNome.trim(), categoria: formAttivitaCategoria }
        : item
    )
    
    saveAttivita(updated)
    setFormAttivitaNome("")
    setFormAttivitaCategoria("")
    setEditingAttivita(null)
    setIsEditAttivitaSheetOpen(false)
    toast.success("Attività aggiornata con successo")
  }

  const handleDeleteAttivita = (id: number) => {
    const updated = attivita.filter((item) => item.id !== id)
    saveAttivita(updated)
    toast.success("Attività eliminata con successo")
  }

  const resetAttivitaForm = () => {
    setFormAttivitaNome("")
    setFormAttivitaCategoria("")
    setEditingAttivita(null)
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  const attivitaColumns = createAttivitaColumns(categorie, handleEditAttivita, handleDeleteAttivita)

  const customActionButton = (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          resetAttivitaForm()
          setIsAddAttivitaSheetOpen(true)
        }}
      >
        <IconPlus className="h-4 w-4 mr-2" />
        Nuova Attività
      </Button>

      <Button
        variant="outline"
        asChild
      >
        <Link href="/impostazioni/attivita/categorie">
          <IconSettings className="h-4 w-4 mr-2" />
          Categorie
        </Link>
      </Button>
    </div>
  )

  return (
    <PageLayout
      title="Attività"
      description="Gestisci le attività degli interventi e le loro categorie"
      isAdminPage={true}
      customActionButton={customActionButton}
    >
      <GenericDataTable
        data={attivita}
        columns={attivitaColumns}
        showItemCount={false}
        emptyStateTitle="Nessuna attività presente"
        emptyStateDescription="Crea la prima attività per organizzare i tuoi interventi."
        emptyStateAction={
          <Button 
            onClick={() => {
              resetAttivitaForm()
              setIsAddAttivitaSheetOpen(true)
            }}
            className="mt-2"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Crea prima attività
          </Button>
        }
      />

      {/* Add Form Sheet */}
      <StandardFormSheet
        open={isAddAttivitaSheetOpen}
        onOpenChange={setIsAddAttivitaSheetOpen}
        title="Nuova Attività"
        description="Crea una nuova attività per gli interventi"
        onSubmit={handleAddAttivita}
        onCancel={() => setIsAddAttivitaSheetOpen(false)}
        submitText="Crea Attività"
      >
        <FormField label="Nome Attività" htmlFor="attivita-nome" required>
          <Input
            id="attivita-nome"
            value={formAttivitaNome}
            onChange={(e) => setFormAttivitaNome(e.target.value)}
            placeholder="Es. Installazione software"
            required
          />
        </FormField>
        
        <FormField label="Categoria" htmlFor="attivita-categoria" required>
          <Select
            value={formAttivitaCategoria}
            onValueChange={setFormAttivitaCategoria}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorie.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.id}: {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </StandardFormSheet>

      <StandardFormSheet
        open={isEditAttivitaSheetOpen}
        onOpenChange={setIsEditAttivitaSheetOpen}
        title="Modifica Attività"
        description="Modifica le informazioni dell'attività selezionata"
        onSubmit={handleUpdateAttivita}
        onCancel={() => setIsEditAttivitaSheetOpen(false)}
        submitText="Salva Modifiche"
      >
        <FormField label="Nome Attività" htmlFor="edit-attivita-nome" required>
          <Input
            id="edit-attivita-nome"
            value={formAttivitaNome}
            onChange={(e) => setFormAttivitaNome(e.target.value)}
            placeholder="Es. Installazione software"
            required
          />
        </FormField>
        
        <FormField label="Categoria" htmlFor="edit-attivita-categoria" required>
          <Select
            value={formAttivitaCategoria}
            onValueChange={setFormAttivitaCategoria}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorie.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.id}: {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  )
}
