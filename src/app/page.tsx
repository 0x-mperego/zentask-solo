"use client"

import { Suspense } from "react"
import { PageLayout } from "@/components/page-layout"
import { StandardFormSheet } from "@/components/standard-form-sheet"
import { FormField } from "@/components/form-field"
import { GenericDataTable } from "@/components/generic-data-table"
import { DataTableToolbar, FilterOption } from "@/components/data-table-toolbar"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Combobox } from "@/components/ui/combobox"
import { TimeInput } from "@/components/ui/time-input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { FileUploadFormField } from "@/components/file-upload-form-field"
import { DateRange } from "react-day-picker"
import { 
  IconCircleCheckFilled, 
  IconLoader,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCalendar,
  IconClock,
  IconAlertTriangle,
  IconPaperclip,
  IconUser,
  IconBuilding,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type FileUploadProps } from "@/components/ui/file-upload"

// Interfacce per le entità correlate
interface Stato {
  id: number
  nome: string
  colore: string
}

interface Attivita {
  id: number
  nome: string
  categoria: string
}

interface Cliente {
  id: number
  tipo: "Privato" | "Azienda"
  nome: string
  telefono: string
  note?: string
}

interface Utente {
  id: number
  nome: string
  cognome: string
  avatar?: string
  email: string
  ruolo: "admin" | "operatore"
  password: string
}

// Interfaccia per gli allegati
interface Allegato {
  name: string
  url: string
  size: number
  type: string
}

// Interfaccia principale per gli interventi
interface Intervento {
  id: number
  codice: string // Es: INT-00123
  descrizione: string
  attivitaId: number
  clienteId: number
  statoId: number
  urgente: boolean
  dipendenteId: number
  dataInizio: string // formato YYYY-MM-DD
  dataFine: string // formato YYYY-MM-DD
  durata: string // formato HH:MM
  note: string
  allegati: Allegato[] // Array di allegati
  createdAt: string
}

const generateCodiceIntervento = (id: number): string => {
  return `INT-${id.toString().padStart(5, '0')}`
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT')
}

const getInitials = (nome: string, cognome: string): string => {
  return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase()
}

const renderInterventoCard = (
  intervento: Intervento, 
  stati: Stato[], 
  clienti: Cliente[], 
  attivita: Attivita[], 
  utenti: Utente[],
  onClick?: () => void
) => {
  const stato = stati.find(s => s.id === intervento.statoId)
  const cliente = clienti.find(c => c.id === intervento.clienteId)  
  const attivitaItem = attivita.find(a => a.id === intervento.attivitaId)
  const dipendente = utenti.find(u => u.id === intervento.dipendenteId)

  return (
    <Card 
      className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-muted-foreground">
                  {intervento.codice}
                </span>
                {intervento.urgente && (
                  <IconAlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <h3 className="font-medium leading-none">{intervento.descrizione}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {stato && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{
                  backgroundColor: `${stato.colore}15`,
                  borderColor: stato.colore,
                  color: stato.colore,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: stato.colore }}
                />
                {stato.nome}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <div className="flex items-center gap-1 mt-1">
                {cliente?.tipo === "Azienda" ? (
                  <IconBuilding className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <IconUser className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="font-medium">{cliente?.nome || 'Non specificato'}</span>
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground">Attività:</span>
              <p className="font-medium">{attivitaItem?.nome || 'Non specificata'}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Dipendente:</span>
              <div className="flex items-center gap-2 mt-1">
                {dipendente && (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={dipendente.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(dipendente.nome, dipendente.cognome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {dipendente.nome} {dipendente.cognome}
                    </span>
                  </>
                )}
                {!dipendente && <span className="text-muted-foreground">Non assegnato</span>}
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconCalendar className="h-3 w-3" />
                {formatDate(intervento.dataInizio)} - {formatDate(intervento.dataFine)}
              </div>
              {intervento.durata && (
                <div className="flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {intervento.durata}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const createInterventiColumns = (
  stati: Stato[],
  clienti: Cliente[],
  attivita: Attivita[],
  utenti: Utente[],
  onRowClick: (item: Intervento) => void,
  onDelete: (id: number) => void
): ColumnDef<Intervento>[] => [
  {
    accessorKey: "codice",
    header: "Codice",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.codice}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "descrizione",
    header: "Descrizione",
    cell: ({ row }) => {
      const intervento = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{intervento.descrizione}</span>
          {intervento.urgente && (
            <IconAlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "clienteId",
    header: "Cliente",
    cell: ({ row }) => {
      const cliente = clienti.find(c => c.id === row.original.clienteId)
      if (!cliente) return <span className="text-muted-foreground">—</span>
      
      return (
        <span className="font-medium">{cliente.nome}</span>
      )
    },
  },
  {
    accessorKey: "statoId",
    header: "Stato",
    cell: ({ row }) => {
      const stato = stati.find(s => s.id === row.original.statoId)
      if (!stato) return <span className="text-muted-foreground">—</span>
      
      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${stato.colore}15`,
            borderColor: stato.colore,
            color: stato.colore,
          }}
        >
          <div
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: stato.colore }}
          />
          {stato.nome}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dipendenteId",
    header: "Dipendente",
    cell: ({ row }) => {
      const dipendente = utenti.find(u => u.id === row.original.dipendenteId)
      if (!dipendente) return <span className="text-muted-foreground">Non assegnato</span>
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={dipendente.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(dipendente.nome, dipendente.cognome)}
            </AvatarFallback>
          </Avatar>
          <span>{dipendente.nome} {dipendente.cognome}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "dataInizio",
    header: "Date",
    cell: ({ row }) => {
      const intervento = row.original
      const dataInizio = intervento.dataInizio
      const dataFine = intervento.dataFine
      
      // Se non c'è data di fine o le date coincidono, mostra solo data di inizio
      if (!dataFine || dataInizio === dataFine) {
        return (
          <div className="text-sm">
            <div>{formatDate(dataInizio)}</div>
          </div>
        )
      }
      
      // Altrimenti mostra entrambe le date
      return (
        <div className="text-sm">
          <div>{formatDate(dataInizio)}</div>
          <div className="text-muted-foreground text-xs">
            → {formatDate(dataFine)}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Azioni",
    cell: ({ row }) => {
      const intervento = row.original
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
            <DropdownMenuItem onClick={() => onRowClick(intervento)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(intervento.id)}
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

export default function Home() {
  // Stati principali
  const [interventi, setInterventi] = useState<Intervento[]>([])
  const [stati, setStati] = useState<Stato[]>([])
  const [attivita, setAttivita] = useState<Attivita[]>([])
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [utenti, setUtenti] = useState<Utente[]>([])
  
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Intervento | null>(null)
  
  // Stato per ricerca e filtri
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    descrizione: "",
    attivitaId: "",
    clienteId: "",
    statoId: "",
    urgente: false,
    dipendenteId: "",
    dateRange: undefined as DateRange | undefined,
    durata: "",
    note: "",
    allegati: [] as File[],
    uploadedAllegati: [] as Allegato[],
  })

  const { isLoading, isAuthenticated, user } = useAuth()
  const isMobile = useIsMobile()

  // Caricamento dati da localStorage
  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = () => {
      try {
        // Carica Stati
        const savedStati = localStorage.getItem("zentask_stati")
        if (savedStati) {
          setStati(JSON.parse(savedStati))
        }

        // Carica Attività
        const savedAttivita = localStorage.getItem("zentask_attivita_v2")
        if (savedAttivita) {
          setAttivita(JSON.parse(savedAttivita))
        }

        // Carica Clienti
        const savedClienti = localStorage.getItem("zentask_clienti")
        if (savedClienti) {
          setClienti(JSON.parse(savedClienti))
        }

        // Carica Utenti
        const savedUtenti = localStorage.getItem("zentask_utenti")
        if (savedUtenti) {
          setUtenti(JSON.parse(savedUtenti))
        }

        // Carica Interventi
        const savedInterventi = localStorage.getItem("zentask_interventi")
        if (savedInterventi) {
          setInterventi(JSON.parse(savedInterventi))
        } else {
          // Dati di esempio se non ci sono interventi salvati
          const defaultInterventi: Intervento[] = []
          setInterventi(defaultInterventi)
          localStorage.setItem("zentask_interventi", JSON.stringify(defaultInterventi))
        }
      } catch (error) {
        console.error("Errore caricamento dati:", error)
        setInterventi([])
      }
      setDataLoaded(true)
    }

    loadData()
  }, [isAuthenticated])

  // Configurazione filtri
  const filters: FilterOption[] = [
    {
      key: "statoId",
      label: "Stato",
      options: [
        ...stati.map(stato => ({
          value: stato.id.toString(),
          label: stato.nome
        }))
      ]
    },
    {
      key: "urgente",
      label: "Priorità",
      options: [
        { value: "true", label: "Urgente" },
        { value: "false", label: "Normale" }
      ]
    },
    {
      key: "attivitaId",
      label: "Attività",
      options: [
        ...attivita.map(att => ({
          value: att.id.toString(),
          label: att.nome
        }))
      ]
    },
    {
      key: "dipendenteId",
      label: "Dipendente",
      options: [
        ...utenti.filter(u => u.ruolo === 'operatore').map(utente => ({
          value: utente.id.toString(),
          label: `${utente.nome} ${utente.cognome}`
        }))
      ]
    }
  ]

  // Handle row click per edit
  const handleRowClick = (item: Intervento) => {
    setEditingItem(item)
    const dateRange: DateRange | undefined = item.dataInizio && item.dataFine 
      ? { from: new Date(item.dataInizio), to: new Date(item.dataFine) }
      : undefined
    
    setFormData({
      descrizione: item.descrizione,
      attivitaId: item.attivitaId.toString(),
      clienteId: item.clienteId.toString(),
      statoId: item.statoId.toString(),
      urgente: item.urgente,
      dipendenteId: item.dipendenteId.toString(),
      dateRange: dateRange,
      durata: item.durata,
      note: item.note,
      allegati: [], // i file esistenti sono in uploadedAllegati, questo è per i nuovi
      uploadedAllegati: item.allegati || [],
    })
    setIsSheetOpen(true)
  }

  // Gestione dei filtri
  const handleFilterChange = (key: string, value: string | null) => {
    setActiveFilters(prev => {
      if (value === null || value === "__all__") {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }

  // Gestione upload
  const handleUpload: FileUploadProps["onUpload"] = async (
    files,
    { onProgress, onSuccess, onError }
  ) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload")

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(file, percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            if (data.success) {
              setFormData(prev => ({
                ...prev,
                uploadedAllegati: [
                  ...prev.uploadedAllegati,
                  { name: file.name, url: data.url, size: file.size, type: file.type }
                ]
              }))
              onSuccess(file)
            } else {
              throw new Error(data.error || 'Upload failed.')
            }
          } catch (e) {
            onError(file, e instanceof Error ? e : new Error("Failed to parse server response."))
          }
        } else {
          onError(file, new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        onError(file, new Error("An error occurred during the upload."))
      }

      xhr.send(formData)
    }
  }

  // Gestione eliminazione
  const handleDelete = (id: number) => {
    if (confirm("Sei sicuro di voler eliminare questo intervento?")) {
      try {
        const updatedInterventi = interventi.filter(item => item.id !== id)
        localStorage.setItem("zentask_interventi", JSON.stringify(updatedInterventi))
        setInterventi(updatedInterventi)
        toast.success("Intervento eliminato con successo")
      } catch (error) {
        console.error("Errore eliminazione:", error)
        toast.error("Errore durante l'eliminazione")
      }
    }
  }

  // Filtraggio dei dati
  const filteredInterventi = interventi.filter(intervento => {
    // Filtro per ricerca
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      const cliente = clienti.find(c => c.id === intervento.clienteId)
      const attivitaItem = attivita.find(a => a.id === intervento.attivitaId)
      const dipendente = utenti.find(u => u.id === intervento.dipendenteId)
      
      if (
        !intervento.codice.toLowerCase().includes(searchLower) &&
        !intervento.descrizione.toLowerCase().includes(searchLower) &&
        !(cliente?.nome || "").toLowerCase().includes(searchLower) &&
        !(attivitaItem?.nome || "").toLowerCase().includes(searchLower) &&
        !(dipendente ? `${dipendente.nome} ${dipendente.cognome}` : "").toLowerCase().includes(searchLower) &&
        !intervento.note.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Filtri specifici
    if (activeFilters.statoId && intervento.statoId.toString() !== activeFilters.statoId) {
      return false
    }

    if (activeFilters.urgente && intervento.urgente.toString() !== activeFilters.urgente) {
      return false
    }

    if (activeFilters.attivitaId && intervento.attivitaId.toString() !== activeFilters.attivitaId) {
      return false
    }

    if (activeFilters.dipendenteId && intervento.dipendenteId.toString() !== activeFilters.dipendenteId) {
      return false
    }

    return true
  })

  // Crea colonne con gestori
  const columns = createInterventiColumns(stati, clienti, attivita, utenti, handleRowClick, handleDelete)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.descrizione.trim()) {
      toast.error("La descrizione è obbligatoria")
      return
    }

    if (!formData.attivitaId) {
      toast.error("Seleziona un'attività")
      return
    }

    if (!formData.clienteId) {
      toast.error("Seleziona un cliente")
      return
    }

    if (!formData.statoId) {
      toast.error("Seleziona uno stato")
      return
    }

    if (!formData.dipendenteId) {
      toast.error("Seleziona un dipendente")
      return
    }

    if (!formData.dateRange?.from) {
      toast.error("La data di inizio è obbligatoria")
      return
    }

    // Data di fine non più obbligatoria - può essere uguale alla data di inizio

    if (formData.dateRange.to && formData.dateRange.to < formData.dateRange.from) {
      toast.error("La data di fine deve essere successiva alla data di inizio")
      return
    }

    try {
      const finalAllegati = [
        ...(editingItem?.allegati || []),
        ...formData.uploadedAllegati
      ].filter((allegato, index, self) =>
        index === self.findIndex((a) => a.url === allegato.url)
      )

      if (editingItem) {
        // Modifica intervento esistente
        const updatedInterventi = interventi.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                descrizione: formData.descrizione.trim(),
                attivitaId: parseInt(formData.attivitaId),
                clienteId: parseInt(formData.clienteId),
                statoId: parseInt(formData.statoId),
                urgente: formData.urgente,
                dipendenteId: parseInt(formData.dipendenteId),
                dataInizio: formData.dateRange?.from?.toISOString().split('T')[0] || '',
                dataFine: formData.dateRange?.to?.toISOString().split('T')[0] || formData.dateRange?.from?.toISOString().split('T')[0] || '',
                durata: formData.durata,
                note: formData.note,
                allegati: finalAllegati,
              }
            : item
        )
        
        localStorage.setItem("zentask_interventi", JSON.stringify(updatedInterventi))
        setInterventi(updatedInterventi)
        toast.success("Intervento aggiornato con successo!")
      } else {
        // Crea nuovo intervento
        const newId = Math.max(...interventi.map(i => i.id), 0) + 1
        const newIntervento: Intervento = {
          id: newId,
          codice: generateCodiceIntervento(newId),
          descrizione: formData.descrizione.trim(),
          attivitaId: parseInt(formData.attivitaId),
          clienteId: parseInt(formData.clienteId),
          statoId: parseInt(formData.statoId),
          urgente: formData.urgente,
          dipendenteId: parseInt(formData.dipendenteId),
          dataInizio: formData.dateRange?.from?.toISOString().split('T')[0] || '',
          dataFine: formData.dateRange?.to?.toISOString().split('T')[0] || formData.dateRange?.from?.toISOString().split('T')[0] || '',
          durata: formData.durata,
          note: formData.note,
          allegati: finalAllegati,
          createdAt: new Date().toISOString(),
        }

        const updatedInterventi = [...interventi, newIntervento]
        localStorage.setItem("zentask_interventi", JSON.stringify(updatedInterventi))
        setInterventi(updatedInterventi)
        toast.success("Nuovo intervento creato con successo!")
      }

      // Reset form e chiudi sheet
      setFormData({
        descrizione: "",
        attivitaId: "",
        clienteId: "",
        statoId: "",
        urgente: false,
        dipendenteId: "",
        dateRange: undefined,
        durata: "",
        note: "",
        allegati: [],
        uploadedAllegati: [],
      })
      setIsSheetOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Errore salvataggio:", error)
      toast.error("Errore durante il salvataggio")
    }
  }

  const handleOpenSheet = () => {
    setEditingItem(null)
    
    // Default: Stato "Aperto" e data di inizio oggi
    const statoAperto = stati.find(s => s.nome === "Aperto")
    const oggi = new Date()
    
    // Trova l'utente attualmente loggato nei dati utenti
    const currentUser = utenti.find(u => u.email === user?.email)
    
    setFormData({
      descrizione: "",
      attivitaId: "",
      clienteId: "",
      statoId: statoAperto ? statoAperto.id.toString() : "",
      urgente: false,
      dipendenteId: currentUser ? currentUser.id.toString() : "",
      dateRange: { from: oggi, to: undefined },
      durata: "",
      note: "",
      allegati: [],
      uploadedAllegati: [],
    })
    setIsSheetOpen(true)
  }

  if (isLoading || !isAuthenticated || !dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageLayout 
        title="Interventi"
        description="Gestisci e monitora tutti i tuoi interventi da un'unica dashboard centrale."
      >
        <GenericDataTable 
          data={interventi}
          columns={columns}
          onRowClick={handleRowClick}
          itemName="interventi"
          mobileCardRender={(item, onClick) => 
            renderInterventoCard(item, stati, clienti, attivita, utenti, onClick)
          }
          filteredData={filteredInterventi}
          emptyStateTitle="Nessun intervento presente"
          emptyStateDescription="Inizia creando il tuo primo intervento per gestire le attività del progetto."
          emptyStateAction={
            <Button 
              onClick={handleOpenSheet}
              className="mt-2"
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Crea primo intervento
            </Button>
          }
          toolbar={
            <DataTableToolbar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Cerca interventi..."
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              actionButton={
                <Button onClick={handleOpenSheet}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Nuovo Intervento
                </Button>
              }
            />
          }
        />
      </PageLayout>

      {/* Form Sheet per Creazione/Modifica */}
      <StandardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingItem ? "Modifica Intervento" : "Nuovo Intervento"}
        description={editingItem
          ? "Modifica i dettagli dell'intervento selezionato"
          : "Crea un nuovo intervento compilando tutti i campi richiesti"}
        onSubmit={handleSubmit}
        onCancel={() => setIsSheetOpen(false)}
        submitText={editingItem ? "Salva Modifiche" : "Crea Intervento"}
      >
        <FormField label="Descrizione" htmlFor="descrizione" required>
          <Input
            id="descrizione"
            value={formData.descrizione}
            onChange={(e) =>
              setFormData({ ...formData, descrizione: e.target.value })
            }
            placeholder="Breve descrizione dell'intervento"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Attività" htmlFor="attivitaId" required>
            <Combobox
              options={attivita.map((att) => ({
                value: att.id.toString(),
                label: att.nome,
              }))}
              value={formData.attivitaId}
              onValueChange={(value) =>
                setFormData({ ...formData, attivitaId: value })
              }
              placeholder="Seleziona attività"
              searchPlaceholder="Cerca attività..."
              emptyText="Nessuna attività trovata"
              useDrawerOnMobile={true}
              showCheck={false}
              className="w-full"
            />
          </FormField>

          <FormField label="Cliente" htmlFor="clienteId" required>
            <Combobox
              options={clienti.map((cliente) => ({
                value: cliente.id.toString(),
                label: cliente.nome,
              }))}
              value={formData.clienteId}
              onValueChange={(value) =>
                setFormData({ ...formData, clienteId: value })
              }
              placeholder="Seleziona cliente"
              searchPlaceholder="Cerca cliente..."
              emptyText="Nessun cliente trovato"
              useDrawerOnMobile={true}
              showIcon={false}
              showCheck={false}
              className="w-full"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Stato" htmlFor="statoId" required>
            <Select
              value={formData.statoId}
              onValueChange={(value) =>
                setFormData({ ...formData, statoId: value })
              }
            >
              <SelectTrigger id="statoId" className="w-full">
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                {stati.map((stato) => (
                  <SelectItem key={stato.id} value={stato.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stato.colore }}
                      />
                      {stato.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Dipendente" htmlFor="dipendenteId" required>
            <Select
              value={formData.dipendenteId}
              onValueChange={(value) =>
                setFormData({ ...formData, dipendenteId: value })
              }
            >
              <SelectTrigger id="dipendenteId" className="w-full">
                <SelectValue placeholder="Seleziona dipendente" />
              </SelectTrigger>
              <SelectContent>
                {utenti.filter(u => u.ruolo === 'operatore').map((utente) => (
                  <SelectItem key={utente.id} value={utente.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={utente.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(utente.nome, utente.cognome)}
                        </AvatarFallback>
                      </Avatar>
                      {utente.nome} {utente.cognome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="urgente"
            checked={formData.urgente}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, urgente: checked as boolean })
            }
          />
          <Label htmlFor="urgente" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Urgenza
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Intervento" htmlFor="dateRange" required description="Data fine opzionale (se non specificata, sarà uguale alla data inizio)">
            <DateRangePicker
              value={formData.dateRange}
              onChange={(range) =>
                setFormData({ ...formData, dateRange: range })
              }
              placeholder="Seleziona date intervento"
            />
          </FormField>

          <FormField label="Durata" htmlFor="durata">
            <TimeInput
              value={formData.durata}
              onChange={(value) =>
                setFormData({ ...formData, durata: value })
              }
              placeholder="00:00"
            />
          </FormField>
        </div>

        <FormField label="Note" htmlFor="note">
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) =>
              setFormData({ ...formData, note: e.target.value })
            }
            placeholder="Note aggiuntive, dettagli tecnici o commenti..."
            rows={3}
          />
        </FormField>

        {formData.uploadedAllegati.length > 0 && (
          <div>
            <Label>Allegati caricati</Label>
            <ul className="mt-2 space-y-2">
              {formData.uploadedAllegati.map((allegato, index) => (
                <li key={index} className="flex items-center justify-between text-sm p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <IconPaperclip className="h-4 w-4" />
                    <a href={allegato.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {allegato.name}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        uploadedAllegati: prev.uploadedAllegati.filter((_, i) => i !== index)
                      }))
                    }}
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <FileUploadFormField
          label="Aggiungi nuovi allegati"
          files={formData.allegati}
          onFilesChange={(files: File[]) =>
              setFormData({ ...formData, allegati: files })
            }
          onUpload={handleUpload}
          maxSize={10 * 1024 * 1024} // 10MB
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar"
          uploadLabel="Carica documenti"
          uploadDescription="Trascina i file qui o clicca per sfogliare"
        />
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
    </>
  )
}
