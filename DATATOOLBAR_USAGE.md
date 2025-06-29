# DataTableToolbar - Guida all'Implementazione

## Panoramica

La `DataTableToolbar` è un componente avanzato che fornisce funzionalità di ricerca e filtraggio per le tabelle. Include:

- **Campo di ricerca** con icona
- **Filtri dropdown** configurabili
- **Contatore filtri attivi** con badge
- **Gestione filtri attivi** con chip removibili
- **Pulsante azione principale** integrato
- **Layout responsive**

## Struttura Base

```tsx
import { DataTableToolbar, FilterOption } from "@/components/data-table-toolbar"

// 1. Stato per ricerca e filtri
const [searchValue, setSearchValue] = useState("")
const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

// 2. Definizione filtri
const filters: FilterOption[] = [
  {
    key: "status",
    label: "Stato",
    options: [
      { value: "active", label: "Attivo" },
      { value: "inactive", label: "Inattivo" },
    ]
  }
]

// 3. Gestione filtri
const handleFilterChange = (key: string, value: string | null) => {
  setActiveFilters(prev => {
    if (value === null) {
      const { [key]: _, ...rest } = prev
      return rest
    }
    return { ...prev, [key]: value }
  })
}

// 4. Filtraggio dati
const filteredData = data.filter(item => {
  // Ricerca
  if (searchValue) {
    const searchLower = searchValue.toLowerCase()
    if (!item.name.toLowerCase().includes(searchLower)) {
      return false
    }
  }
  
  // Filtri
  if (activeFilters.status && item.status !== activeFilters.status) {
    return false
  }
  
  return true
})

// 5. Utilizzo nel GenericDataTable
<GenericDataTable
  data={data}
  filteredData={filteredData}
  toolbar={
    <DataTableToolbar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Cerca..."
      filters={filters}
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
      actionButton={
        <Button onClick={handleAction}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nuovo Elemento
        </Button>
      }
    />
  }
/>
```

## Esempi di Implementazione

### Homepage - Interventi

```tsx
// Filtri per interventi
const filters: FilterOption[] = [
  {
    key: "status",
    label: "Stato",
    options: [
      { value: "pending", label: "In Attesa" },
      { value: "in-progress", label: "In Corso" },
      { value: "completed", label: "Completato" },
      { value: "cancelled", label: "Annullato" },
    ]
  },
  {
    key: "type",
    label: "Tipo",
    options: [
      { value: "maintenance", label: "Manutenzione" },
      { value: "installation", label: "Installazione" },
      { value: "repair", label: "Riparazione" },
      { value: "consultation", label: "Consulenza" },
    ]
  },
  {
    key: "priority",
    label: "Priorità",
    options: [
      { value: "high", label: "Alta" },
      { value: "medium", label: "Media" },
      { value: "low", label: "Bassa" },
    ]
  }
]

// Filtraggio per interventi
const filteredInterventions = interventions.filter(intervention => {
  if (searchValue) {
    const searchLower = searchValue.toLowerCase()
    if (!intervention.header.toLowerCase().includes(searchLower) &&
        !intervention.target.toLowerCase().includes(searchLower) &&
        !intervention.reviewer.toLowerCase().includes(searchLower)) {
      return false
    }
  }
  
  if (activeFilters.status && intervention.status !== activeFilters.status) {
    return false
  }
  
  if (activeFilters.type && intervention.type !== activeFilters.type) {
    return false
  }
  
  return true
})
```

### Pagina Clienti

```tsx
// Filtri per clienti
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

// Filtraggio per clienti
const filteredClienti = clienti.filter(cliente => {
  if (searchValue) {
    const searchLower = searchValue.toLowerCase()
    if (!cliente.nome.toLowerCase().includes(searchLower) &&
        !cliente.telefono.includes(searchValue) &&
        !(cliente.note || "").toLowerCase().includes(searchLower)) {
      return false
    }
  }
  
  if (activeFilters.tipo && cliente.tipo !== activeFilters.tipo) {
    return false
  }
  
  return true
})
```

## Props della DataTableToolbar

### Ricerca
- `searchValue: string` - Valore corrente della ricerca
- `onSearchChange: (value: string) => void` - Callback per cambio ricerca
- `searchPlaceholder?: string` - Placeholder del campo ricerca

### Filtri
- `filters?: FilterOption[]` - Array di filtri disponibili
- `activeFilters?: Record<string, string>` - Filtri attualmente attivi
- `onFilterChange?: (key: string, value: string | null) => void` - Callback per cambio filtri

### Azioni
- `actionButton?: React.ReactNode` - Pulsante azione principale

### Layout
- `className?: string` - Classi CSS aggiuntive

## Interfaccia FilterOption

```tsx
interface FilterOption {
  key: string          // Chiave univoca del filtro
  label: string        // Etichetta mostrata nell'UI
  options: {           // Opzioni del filtro
    value: string      // Valore dell'opzione
    label: string      // Etichetta dell'opzione
  }[]
}
```

## Funzionalità Avanzate

### Filtri Multipli
```tsx
const filters: FilterOption[] = [
  {
    key: "category",
    label: "Categoria",
    options: [
      { value: "tech", label: "Tecnico" },
      { value: "admin", label: "Amministrativo" },
    ]
  },
  {
    key: "status",
    label: "Stato",
    options: [
      { value: "open", label: "Aperto" },
      { value: "closed", label: "Chiuso" },
    ]
  }
]
```

### Ricerca Multi-Campo
```tsx
const filteredData = data.filter(item => {
  if (searchValue) {
    const searchLower = searchValue.toLowerCase()
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.code.toLowerCase().includes(searchLower)
    )
  }
  return true
})
```

### Filtri Condizionali
```tsx
const filteredData = data.filter(item => {
  // Ricerca
  if (searchValue && !matchesSearch(item, searchValue)) {
    return false
  }
  
  // Filtri AND (tutti devono essere soddisfatti)
  for (const [key, value] of Object.entries(activeFilters)) {
    if (value && item[key] !== value) {
      return false
    }
  }
  
  return true
})
```

## Best Practices

1. **Performance**: Usa `useMemo` per filtri complessi
2. **UX**: Fornisci placeholder descrittivi
3. **Accessibilità**: Usa label appropriate
4. **Responsive**: La toolbar si adatta automaticamente
5. **Consistenza**: Usa gli stessi pattern in tutta l'app

## Note di Implementazione

- La toolbar sostituisce il `customActionButton` del `PageLayout`
- I dati filtrati vanno passati come `filteredData` al `GenericDataTable`
- I filtri attivi vengono mostrati come chip removibili
- Il contatore dei filtri appare solo quando ci sono filtri attivi
- La ricerca è case-insensitive di default
- Il valore speciale `"__all__"` viene usato internamente per "Tutti" (non usare nei tuoi dati) 