'use client';

import {
  IconChevronDown,
  IconFilter,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pill, PillButton } from '@/components/ui/kibo-ui/pill';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableToolbarProps {
  // Ricerca
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filtri
  filters?: FilterOption[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string | null) => void;

  // Azioni
  actionButton?: React.ReactNode;

  // Layout
  className?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cerca...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  actionButton,
  className,
}: DataTableToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Conta i filtri attivi
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  // Rimuovi un filtro specifico
  const removeFilter = (key: string) => {
    onFilterChange?.(key, null);
  };

  // Rimuovi tutti i filtri
  const clearAllFilters = () => {
    Object.keys(activeFilters).forEach((key) => {
      onFilterChange?.(key, null);
    });
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Prima riga: Ricerca e Azioni */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {/* Campo di ricerca */}
          <div className="relative max-w-sm flex-1">
            <IconSearch className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              value={searchValue}
            />
          </div>

          {/* Pulsante Filtri */}
          {filters.length > 0 && (
            <Popover onOpenChange={setIsFilterOpen} open={isFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="h-9 border-dashed"
                  size="sm"
                  variant="outline"
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtri
                  {activeFilterCount > 0 && (
                    <Pill
                      className="ml-2 h-5 w-5 rounded-full border-border bg-transparent p-0 font-medium text-[0.75rem] text-muted-foreground"
                      style={{
                        borderWidth: '1px',
                        fontWeight: '500',
                      }}
                      variant="outline"
                    >
                      {activeFilterCount}
                    </Pill>
                  )}
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filtri</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        className="h-auto p-0 text-muted-foreground text-xs hover:text-foreground"
                        onClick={clearAllFilters}
                        size="sm"
                        variant="ghost"
                      >
                        Cancella tutto
                      </Button>
                    )}
                  </div>

                  {filters.map((filter) => (
                    <div className="space-y-2" key={filter.key}>
                      <label className="font-medium text-sm">
                        {filter.label}
                      </label>
                      <Select
                        onValueChange={(value) =>
                          onFilterChange?.(
                            filter.key,
                            value === '__all__' ? null : value
                          )
                        }
                        value={activeFilters[filter.key] || '__all__'}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue
                            placeholder={`Seleziona ${filter.label.toLowerCase()}`}
                          />
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
        {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
      </div>

      {/* Seconda riga: Filtri attivi (se presenti) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Filtri attivi:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;

            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);

            return (
              <Pill
                className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
                key={key}
                style={{
                  borderWidth: '1px',
                  fontWeight: '500',
                }}
                variant="outline"
              >
                <span>
                  {filter?.label}: {option?.label || value}
                </span>
                <PillButton onClick={() => removeFilter(key)}>
                  <IconX className="h-3 w-3" />
                </PillButton>
              </Pill>
            );
          })}
          <Button
            className="h-auto px-2 py-1 text-muted-foreground text-xs hover:text-foreground"
            onClick={clearAllFilters}
            size="sm"
            variant="ghost"
          >
            Cancella tutto
          </Button>
        </div>
      )}
    </div>
  );
}
