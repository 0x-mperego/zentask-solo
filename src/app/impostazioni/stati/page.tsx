"use client"

import { useState, useEffect } from "react"
import { GenericDataTable } from "@/components/generic-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/kibo-ui/pill"
import { Plus } from "lucide-react"
import { ColorPicker } from "@/components/color-picker"
import { toast } from "sonner"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"
import { PageLayout } from "@/components/page-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"

interface Stato {
  id: number
  nome: string
  colore: string
}

const STATI_DEFAULT: Stato[] = [
  { id: 1, nome: "Da fare", colore: "#ef4444" },
  { id: 2, nome: "In corso", colore: "#eab308" },
  { id: 3, nome: "Completato", colore: "#22c55e" },
  { id: 4, nome: "Sospeso", colore: "#f97316" },
  { id: 5, nome: "Annullato", colore: "#6b7280" },
]

function createColumns(
  onEdit: (stato: Stato) => void,
  onDelete: (id: number) => void
): ColumnDef<Stato>[] {
  return [
    {
      accessorKey: "nome",
      header: "Nome Stato",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nome")}</div>
      ),
    },
    {
      accessorKey: "colore",
      header: "Colore",
      cell: ({ row }) => {
        const colore = row.getValue("colore") as string
        const nome = row.getValue("nome") as string
        return (
          <Pill
            variant="outline"
            style={{
              backgroundColor: `${colore}15`,
              borderColor: colore,
              color: colore,
            }}
          >
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: colore }}
            />
            {nome}
          </Pill>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const stato = row.original
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
              <DropdownMenuItem onClick={() => onEdit(stato)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(stato.id)}
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

export default function StatiPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [stati, setStati] = useState<Stato[]>([])
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingStato, setEditingStato] = useState<Stato | null>(null)
  
  // Form states
  const [formNome, setFormNome] = useState("")
  const [formColore, setFormColore] = useState("#3b82f6")

  const loadStati = () => {
    const saved = localStorage.getItem("zentask_stati")
    if (saved) {
      try {
        setStati(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading stati:", error)
        setStati(STATI_DEFAULT)
        localStorage.setItem("zentask_stati", JSON.stringify(STATI_DEFAULT))
      }
    } else {
      setStati(STATI_DEFAULT)
      localStorage.setItem("zentask_stati", JSON.stringify(STATI_DEFAULT))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadStati()
    }
  }, [isAuthenticated])

  const saveStati = (newStati: Stato[]) => {
    setStati(newStati)
    localStorage.setItem("zentask_stati", JSON.stringify(newStati))
  }

  const handleAdd = () => {
    if (!formNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }

    const newStato: Stato = {
      id: Date.now(),
      nome: formNome.trim(),
      colore: formColore,
    }

    saveStati([...stati, newStato])
    setFormNome("")
    setFormColore("#3b82f6")
    setIsAddSheetOpen(false)
    toast.success("Stato creato con successo")
  }

  const handleEdit = (stato: Stato) => {
    setEditingStato(stato)
    setFormNome(stato.nome)
    setFormColore(stato.colore)
    setIsEditSheetOpen(true)
  }

  const handleUpdate = () => {
    if (!formNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }

    if (!editingStato) return

    const updated = stati.map((stato) =>
      stato.id === editingStato.id
        ? { ...stato, nome: formNome.trim(), colore: formColore }
        : stato
    )
    
    saveStati(updated)
    setFormNome("")
    setFormColore("#3b82f6")
    setEditingStato(null)
    setIsEditSheetOpen(false)
    toast.success("Stato aggiornato con successo")
  }

  const handleDelete = (id: number) => {
    const updated = stati.filter((stato) => stato.id !== id)
    saveStati(updated)
    toast.success("Stato eliminato con successo")
  }

  const resetForm = () => {
    setFormNome("")
    setFormColore("#3b82f6")
    setEditingStato(null)
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  const columns = createColumns(handleEdit, handleDelete)



  return (
        <PageLayout
      title="Stati"
      description="Gestisci gli stati degli interventi"
      isAdminPage={true}
      customActionButton={
        <Button
          onClick={() => {
            resetForm()
            setIsAddSheetOpen(true)
          }}
        >
          <IconPlus className="h-4 w-4 mr-2" />
          Nuovo Stato
        </Button>
      }
    >
      <GenericDataTable
        data={stati}
        columns={columns}
        showItemCount={false}
        emptyStateTitle="Nessuno stato presente"
        emptyStateDescription="Crea il primo stato per organizzare i tuoi interventi."
        emptyStateAction={
          <Button 
            onClick={() => {
              resetForm()
              setIsAddSheetOpen(true)
            }}
            className="mt-2"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Crea primo stato
          </Button>
        }
      />

      {/* Add Form Sheet */}
      <StandardFormSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        title="Nuovo Stato"
        description="Crea un nuovo stato per gli interventi"
        onSubmit={handleAdd}
        onCancel={() => setIsAddSheetOpen(false)}
        submitText="Crea Stato"
      >
        <FormField label="Nome Stato" htmlFor="add-nome" required>
          <Input
            id="add-nome"
            value={formNome}
            onChange={(e) => setFormNome(e.target.value)}
            placeholder="Es. In revisione"
            required
          />
        </FormField>
        
        <FormField label="Colore" htmlFor="add-colore">
          <ColorPicker
            value={formColore}
            onChange={setFormColore}
          />
        </FormField>
      </StandardFormSheet>

      {/* Edit Form Sheet */}
      <StandardFormSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        title="Modifica Stato"
        description="Modifica le informazioni dello stato selezionato"
        onSubmit={handleUpdate}
        onCancel={() => setIsEditSheetOpen(false)}
        submitText="Salva Modifiche"
      >
        <FormField label="Nome Stato" htmlFor="edit-nome" required>
          <Input
            id="edit-nome"
            value={formNome}
            onChange={(e) => setFormNome(e.target.value)}
            placeholder="Es. In revisione"
            required
          />
        </FormField>
        
        <FormField label="Colore" htmlFor="edit-colore">
                      <ColorPicker
              value={formColore}
              onChange={setFormColore}
            />
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  )
}
