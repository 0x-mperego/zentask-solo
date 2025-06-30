"use client"

import { PageLayout } from "@/components/page-layout"
import { GenericDataTable } from "@/components/generic-data-table"
import { DataTableToolbar, FilterOption } from "@/components/data-table-toolbar"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/kibo-ui/pill"
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

import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  IconBuilding, 
  IconDotsVertical, 
  IconEdit, 
  IconPlus, 
  IconTrash, 
  IconUpload,
  IconUser 
} from "@tabler/icons-react"
import { type ColumnDef } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Cliente {
  id: number
  tipo: "Privato" | "Azienda"
  nome: string
  telefono: string
  note?: string
}

export default function ClientiPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const isMobile = useIsMobile()
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Cliente | null>(null)
  
  // Stato per ricerca e filtri
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  
  // Filtri per i clienti
  const filters: FilterOption[] = [
    {
      key: "tipo",
      label: "Tipo Cliente",
      options: [
        { value: "Privato", label: "Privato" },
        { value: "Azienda", label: "Azienda" },
      ]
    }
  ]
  const [formData, setFormData] = useState({
    tipo: "Privato" as "Privato" | "Azienda",
    nome: "",
    telefono: "",
    note: "",
  })

  const loadClienti = () => {
    const saved = localStorage.getItem("zentask_clienti")
    if (saved) {
      setClienti(JSON.parse(saved))
    } else {
      // Default customers
      const defaultClienti = [
        {
          id: 1,
          tipo: "Azienda" as const,
          nome: "Tech Solutions S.r.l.",
          telefono: "+39 02 1234567",
          note: "Cliente enterprise, contratto annuale",
        },
        {
          id: 2,
          tipo: "Privato" as const,
          nome: "Mario Rossi",
          telefono: "+39 345 6789012",
          note: "Cliente privato, servizi occasionali",
        },
        {
          id: 3,
          tipo: "Azienda" as const,
          nome: "Digital Marketing Plus",
          telefono: "+39 06 9876543",
          note: "Agenzia di marketing, collaborazione continuativa",
        },
      ]
      setClienti(defaultClienti)
      localStorage.setItem("zentask_clienti", JSON.stringify(defaultClienti))
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadClienti()
    }
  }, [isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return null
  }

  const saveClienti = (newClienti: Cliente[]) => {
    localStorage.setItem("zentask_clienti", JSON.stringify(newClienti))
    setClienti(newClienti)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast.error("Il nome del cliente è obbligatorio")
      return
    }

    if (!formData.telefono.trim()) {
      toast.error("Il telefono del cliente è obbligatorio")
      return
    }

    if (editingItem) {
      const updated = clienti.map((item) =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      )
      saveClienti(updated)
      toast.success("Cliente aggiornato con successo")
    } else {
      const newId = Math.max(...clienti.map((c) => c.id), 0) + 1
      const newCliente = { id: newId, ...formData }
      saveClienti([...clienti, newCliente])
      toast.success("Cliente creato con successo")
    }

    setIsSheetOpen(false)
    setEditingItem(null)
    setFormData({ tipo: "Privato", nome: "", telefono: "", note: "" })
  }

  const handleEdit = (item: Cliente) => {
    setEditingItem(item)
    setFormData({
      tipo: item.tipo,
      nome: item.nome,
      telefono: item.telefono,
      note: item.note || "",
    })
    setIsSheetOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo cliente?")) {
      const filtered = clienti.filter((item) => item.id !== id)
      saveClienti(filtered)
      toast.success("Cliente eliminato con successo")
    }
  }

  const handleOpenSheet = () => {
    setEditingItem(null)
    setFormData({ tipo: "Privato", nome: "", telefono: "", note: "" })
    setIsSheetOpen(true)
  }

  // Gestione dei filtri
  const handleFilterChange = (key: string, value: string | null) => {
    setActiveFilters(prev => {
      if (value === null) {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }

  // Filtraggio dei dati
  const filteredClienti = clienti.filter(cliente => {
    // Filtro per ricerca
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      if (!cliente.nome.toLowerCase().includes(searchLower) &&
          !cliente.telefono.includes(searchValue) &&
          !(cliente.note || "").toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filtro per tipo
    if (activeFilters.tipo && cliente.tipo !== activeFilters.tipo) {
      return false
    }

    return true
  })

  const renderClienteCard = (cliente: Cliente, onClick?: () => void) => (
    <Card 
      className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {cliente.tipo === "Azienda" ? (
                <IconBuilding className="h-5 w-5 text-muted-foreground" />
              ) : (
                <IconUser className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none">{cliente.nome}</h3>
                <Pill 
                  variant="outline" 
                  className="bg-transparent border-border text-muted-foreground text-[0.75rem] font-medium px-[10px] py-[2px]"
                  style={{ 
                    borderWidth: '1px',
                    fontWeight: '500'
                  }}
                >
                  {cliente.tipo}
                </Pill>
              </div>
              <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
              {cliente.note && (
                <p className="text-sm text-muted-foreground line-clamp-2">{cliente.note}</p>
              )}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(cliente) }}>
                <IconEdit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id) }}
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

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "nome",
      header: "Cliente",
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <div className="flex items-center gap-2">
            {cliente.tipo === "Azienda" ? (
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
            ) : (
              <IconUser className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="font-medium">{cliente.nome}</div>
              <div className="text-sm text-muted-foreground">
                {cliente.telefono}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <Pill 
            variant="outline" 
            className="bg-transparent border-border text-muted-foreground text-[0.75rem] font-medium px-[10px] py-[2px]"
            style={{ 
              borderWidth: '1px',
              fontWeight: '500'
            }}
          >
            {cliente.tipo}
          </Pill>
        )
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
            {cliente.note || "—"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const cliente = row.original
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
                <DropdownMenuItem onClick={() => handleEdit(cliente)}>
                  <IconEdit className="h-4 w-4 mr-2" />
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(cliente.id)}
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





  return (
    <PageLayout
      title="Clienti"
      description="Gestisci i clienti e le informazioni di contatto"
    >
      <GenericDataTable
        data={clienti}
        columns={columns}
        onRowClick={handleEdit}
        itemName="clienti"
        mobileCardRender={renderClienteCard}
        filteredData={filteredClienti}
        emptyStateTitle="Nessun cliente presente"
        emptyStateDescription="Aggiungi il primo cliente per iniziare a gestire i tuoi contatti."
        emptyStateAction={
          <Button 
            onClick={handleOpenSheet}
            className="mt-2"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Aggiungi primo cliente
          </Button>
        }
        toolbar={
          <DataTableToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Cerca clienti..."
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            actionButton={
              <Button onClick={handleOpenSheet}>
                <IconPlus className="h-4 w-4 mr-2" />
                Nuovo Cliente
              </Button>
            }
          />
        }
      />
      
      {/* Form Sheet */}
      <StandardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingItem ? "Modifica Cliente" : "Nuovo Cliente"}
        description={editingItem
          ? "Modifica i dettagli del cliente"
          : "Aggiungi un nuovo cliente al sistema"}
        onSubmit={handleSubmit}
        onCancel={() => setIsSheetOpen(false)}
        submitText={editingItem ? "Salva Modifiche" : "Crea Cliente"}
      >
        <FormField label="Tipo Cliente" htmlFor="tipo">
          <Select
            value={formData.tipo}
            onValueChange={(value: "Privato" | "Azienda") =>
              setFormData({ ...formData, tipo: value })
            }
          >
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue placeholder="Seleziona tipo cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Privato">Privato</SelectItem>
              <SelectItem value="Azienda">Azienda</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        
        <FormField label="Nome" htmlFor="nome" required>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            placeholder={
              formData.tipo === "Azienda" ? "Nome azienda" : "Nome e cognome"
            }
            required
          />
        </FormField>
        
        <FormField label="Telefono" htmlFor="telefono" required>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            placeholder="+39 123 456 7890"
            required
          />
        </FormField>
        
        <FormField label="Note" htmlFor="note">
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) =>
              setFormData({ ...formData, note: e.target.value })
            }
            placeholder="Note aggiuntive sul cliente..."
          />
        </FormField>
      </StandardFormSheet>
      
      {/* FAB for mobile */}
      {isMobile && (
        <Button
          onClick={handleOpenSheet}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg sm:hidden"
          size="icon"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </PageLayout>
  )
}
