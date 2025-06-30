"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pill, PillButton } from "@/components/ui/kibo-ui/pill"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  IconSearch,
  IconFilter,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react"

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export interface DataTableToolbarProps {
  // Ricerca
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  
  // Filtri
  filters?: FilterOption[]
  activeFilters?: Record<string, string>
  onFilterChange?: (key: string, value: string | null) => void
  
  // Azioni
  actionButton?: React.ReactNode
  
  // Layout
  className?: string
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cerca...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  actionButton,
  className,
}: DataTableToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Conta i filtri attivi
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length
  
  // Rimuovi un filtro specifico
  const removeFilter = (key: string) => {
    onFilterChange?.(key, null)
  }
  
  // Rimuovi tutti i filtri
  const clearAllFilters = () => {
    Object.keys(activeFilters).forEach(key => {
      onFilterChange?.(key, null)
    })
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Prima riga: Ricerca e Azioni */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Campo di ricerca */}
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Pulsante Filtri */}
          {filters.length > 0 && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-dashed"
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtri
                  {activeFilterCount > 0 && (
                    <Pill
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {activeFilterCount}
                    </Pill>
                  )}
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filtri</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancella tutto
                      </Button>
                    )}
                  </div>
                  
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <label className="text-sm font-medium">
                        {filter.label}
                      </label>
                      <Select
                        value={activeFilters[filter.key] || "__all__"}
                        onValueChange={(value) => 
                          onFilterChange?.(filter.key, value === "__all__" ? null : value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={`Seleziona ${filter.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Tutti</SelectItem>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Azione principale */}
        {actionButton && (
          <div className="flex-shrink-0">
            {actionButton}
          </div>
        )}
      </div>
      
      {/* Seconda riga: Filtri attivi (se presenti) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtri attivi:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null
            
            const filter = filters.find(f => f.key === key)
            const option = filter?.options.find(o => o.value === value)
            
            return (
              <Pill
                key={key}
                variant="secondary"
                className="text-xs"
              >
                <span>
                  {filter?.label}: {option?.label || value}
                </span>
                <PillButton onClick={() => removeFilter(key)}>
                  <IconX className="h-3 w-3" />
                </PillButton>
              </Pill>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancella tutto
          </Button>
        </div>
      )}
    </div>
  )
} 