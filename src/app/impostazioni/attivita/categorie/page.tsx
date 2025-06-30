"use client"

import { useState } from "react"
import { GenericDataTable } from "@/components/generic-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/kibo-ui/pill"
import { Plus } from "lucide-react"
import { ColorPicker } from "@/components/color-picker"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"

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
  IconTrash,
} from "@tabler/icons-react"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"

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

function createCategorieColumns(
  onEdit: (categoria: Categoria) => void,
  onDelete: (id: string) => void
): ColumnDef<Categoria>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "nome",
      header: "Nome Categoria",
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
              className="bg-transparent border-border text-muted-foreground text-[0.75rem] font-medium px-[10px] py-[2px]"
              style={{ 
                borderWidth: '1px',
                fontWeight: '500'
              }}
            >
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: colore }}
            />
            <span>
              {nome}
            </span>
          </Pill>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const categoria = row.original
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
              <DropdownMenuItem onClick={() => onEdit(categoria)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(categoria.id)}
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

export default function CategoriePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [categorie, setCategorie] = useState<Categoria[]>([])
  
  // Category states
  const [isAddCategoriaSheetOpen, setIsAddCategoriaSheetOpen] = useState(false)
  const [isEditCategoriaSheetOpen, setIsEditCategoriaSheetOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formCategoriaId, setFormCategoriaId] = useState("")
  const [formCategoriaNome, setFormCategoriaNome] = useState("")
  const [formCategoriaColore, setFormCategoriaColore] = useState("#3b82f6")

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

  useEffect(() => {
    if (isAuthenticated) {
      loadCategorie()
    }
  }, [isAuthenticated])

  const saveCategorie = (newCategorie: Categoria[]) => {
    setCategorie(newCategorie)
    localStorage.setItem("zentask_categorie_v2", JSON.stringify(newCategorie))
  }

  // Category handlers
  const handleAddCategoria = () => {
    if (!formCategoriaId.trim()) {
      toast.error("L'ID è obbligatorio")
      return
    }
    if (!formCategoriaNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }
    if (categorie.some(c => c.id === formCategoriaId.trim().toUpperCase())) {
      toast.error("ID già esistente")
      return
    }

    const newCategoria: Categoria = {
      id: formCategoriaId.trim().toUpperCase(),
      nome: formCategoriaNome.trim(),
      colore: formCategoriaColore,
    }

    saveCategorie([...categorie, newCategoria])
    setFormCategoriaId("")
    setFormCategoriaNome("")
    setFormCategoriaColore("#3b82f6")
    setIsAddCategoriaSheetOpen(false)
    toast.success("Categoria creata con successo")
  }

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormCategoriaId(categoria.id)
    setFormCategoriaNome(categoria.nome)
    setFormCategoriaColore(categoria.colore)
    setIsEditCategoriaSheetOpen(true)
  }

  const handleUpdateCategoria = () => {
    if (!formCategoriaId.trim()) {
      toast.error("L'ID è obbligatorio")
      return
    }
    if (!formCategoriaNome.trim()) {
      toast.error("Il nome è obbligatorio")
      return
    }

    if (!editingCategoria) return

    const trimmedId = formCategoriaId.trim().toUpperCase()
    if (trimmedId !== editingCategoria.id && categorie.some(c => c.id === trimmedId)) {
      toast.error("ID già esistente")
      return
    }

    const updated = categorie.map((item) =>
      item.id === editingCategoria.id
        ? { ...item, id: trimmedId, nome: formCategoriaNome.trim(), colore: formCategoriaColore }
        : item
    )
    
    saveCategorie(updated)
    setFormCategoriaId("")
    setFormCategoriaNome("")
    setFormCategoriaColore("#3b82f6")
    setEditingCategoria(null)
    setIsEditCategoriaSheetOpen(false)
    toast.success("Categoria aggiornata con successo")
  }

  const handleDeleteCategoria = (id: string) => {
    const updated = categorie.filter((item) => item.id !== id)
    saveCategorie(updated)
    toast.success("Categoria eliminata con successo")
  }

  const resetCategoriaForm = () => {
    setFormCategoriaId("")
    setFormCategoriaNome("")
    setFormCategoriaColore("#3b82f6")
    setEditingCategoria(null)
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  const categorieColumns = createCategorieColumns(handleEditCategoria, handleDeleteCategoria)

  const customActionButton = (
    <Button
      onClick={() => {
        resetCategoriaForm()
        setIsAddCategoriaSheetOpen(true)
      }}
    >
      <IconPlus className="h-4 w-4 mr-2" />
      Nuova Categoria
    </Button>
  )

  return (
    <PageLayout
      title="Categorie"
      description="Gestisci le categorie delle attività"
      customActionButton={customActionButton}
      showParentBreadcrumb={true}
      parentPage="Attività"
      parentHref="/impostazioni/attivita"
      isAdminPage={true}
    >
      <GenericDataTable
        data={categorie}
        columns={categorieColumns}
        onRowClick={handleEditCategoria}
        showItemCount={false}
        emptyStateTitle="Nessuna categoria presente"
        emptyStateDescription="Crea la prima categoria per organizzare le tue attività."
        emptyStateAction={
          <Button 
            onClick={() => {
              resetCategoriaForm()
              setIsAddCategoriaSheetOpen(true)
            }}
            className="mt-2"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Crea prima categoria
          </Button>
        }
      />
      
      <StandardFormSheet
        open={isEditCategoriaSheetOpen}
        onOpenChange={setIsEditCategoriaSheetOpen}
        title="Modifica Categoria"
        description="Modifica le informazioni della categoria"
        onSubmit={handleUpdateCategoria}
        onCancel={() => setIsEditCategoriaSheetOpen(false)}
        submitText="Salva Modifiche"
      >
        <FormField label="ID Categoria" htmlFor="edit-categoria-id" required>
          <Input
            id="edit-categoria-id"
            value={formCategoriaId}
            onChange={(e) => setFormCategoriaId(e.target.value)}
            placeholder="Es. LAB"
            required
          />
        </FormField>
        <FormField label="Nome Categoria" htmlFor="edit-categoria-nome" required>
          <Input
            id="edit-categoria-nome"
            value={formCategoriaNome}
            onChange={(e) => setFormCategoriaNome(e.target.value)}
            placeholder="Es. Laboratorio"
            required
          />
        </FormField>
        <FormField label="Colore" htmlFor="edit-categoria-colore">
          <ColorPicker
            value={formCategoriaColore}
            onChange={setFormCategoriaColore}
          />
        </FormField>
      </StandardFormSheet>

      <StandardFormSheet
        open={isAddCategoriaSheetOpen}
        onOpenChange={setIsAddCategoriaSheetOpen}
        title="Nuova Categoria"
        description="Crea una nuova categoria per le attività"
        onSubmit={handleAddCategoria}
        onCancel={() => setIsAddCategoriaSheetOpen(false)}
        submitText="Crea Categoria"
      >
        <FormField label="ID Categoria" htmlFor="add-categoria-id" required>
          <Input
            id="add-categoria-id"
            value={formCategoriaId}
            onChange={(e) => setFormCategoriaId(e.target.value)}
            placeholder="Es. LAB"
            required
          />
        </FormField>
        <FormField label="Nome Categoria" htmlFor="add-categoria-nome" required>
          <Input
            id="add-categoria-nome"
            value={formCategoriaNome}
            onChange={(e) => setFormCategoriaNome(e.target.value)}
            placeholder="Es. Laboratorio"
            required
          />
        </FormField>
        <FormField label="Colore" htmlFor="add-categoria-colore">
          <ColorPicker
            value={formCategoriaColore}
            onChange={setFormCategoriaColore}
          />
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  )
} 