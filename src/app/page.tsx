'use client';

import {
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconCircleCheckFilled,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconLoader,
  IconPaperclip,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Suspense, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import {
  DataTableToolbar,
  type FilterOption,
} from '@/components/data-table-toolbar';
import { FileUploadFormField } from '@/components/file-upload-form-field';
import { FormField } from '@/components/form-field';
import { GenericDataTable } from '@/components/generic-data-table';
import { PageLayout } from '@/components/page-layout';
import { StandardFormSheet } from '@/components/standard-form-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DurationPicker } from '@/components/ui/duration-picker';
import type { FileUploadProps } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Pill, PillAvatar, PillIndicator } from '@/components/ui/kibo-ui/pill';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

// Interfacce per le entità correlate
interface Stato {
  id: number;
  nome: string;
  colore: string;
}

interface Attivita {
  id: number;
  nome: string;
  categoria: string;
}

interface Cliente {
  id: number;
  tipo: 'Privato' | 'Azienda';
  nome: string;
  telefono: string;
  note?: string;
}

interface Utente {
  id: number;
  nome: string;
  cognome: string;
  avatar?: string;
  email: string;
  ruolo: 'admin' | 'operatore';
  password: string;
}

// Interfaccia per gli allegati
interface Allegato {
  name: string;
  url: string;
  size: number;
  type: string;
}

// Interfaccia principale per gli interventi
interface Intervento {
  id: number;
  codice: string; // Es: INT-00123
  descrizione: string;
  attivitaId: number;
  clienteId: number;
  statoId: number;
  urgente: boolean;
  dipendenteId: number;
  dataInizio: string; // formato YYYY-MM-DD
  dataFine: string; // formato YYYY-MM-DD
  durata: string; // formato HH:MM
  note: string;
  allegati: Allegato[]; // Array di allegati
  createdAt: string;
}

const generateCodiceIntervento = (id: number): string => {
  return `INT-${id.toString().padStart(5, '0')}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (nome: string, cognome: string): string => {
  return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
};

const renderInterventoCard = (
  intervento: Intervento,
  stati: Stato[],
  clienti: Cliente[],
  attivita: Attivita[],
  utenti: Utente[],
  onClick?: () => void
) => {
  const stato = stati.find((s) => s.id === intervento.statoId);
  const cliente = clienti.find((c) => c.id === intervento.clienteId);
  const attivitaItem = attivita.find((a) => a.id === intervento.attivitaId);
  const dipendente = utenti.find((u) => u.id === intervento.dipendenteId);

  return (
    <Card
      className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="w-4 flex-shrink-0">
                  {intervento.urgente && (
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="font-mono text-muted-foreground text-sm">
                  {intervento.codice}
                </span>
              </div>
              <h3 className="font-medium leading-none">
                {intervento.descrizione}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stato && (
              <Pill
                className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
                style={{
                  borderWidth: '1px',
                  fontWeight: '500',
                }}
                variant="outline"
              >
                <div
                  className="mr-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: stato.colore }}
                />
                <span>{stato.nome}</span>
              </Pill>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <div className="mt-1 flex items-center gap-1">
                {cliente?.tipo === 'Azienda' ? (
                  <IconBuilding className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <IconUser className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="font-medium">
                  {cliente?.nome || 'Non specificato'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Attività:</span>
              <p className="font-medium">
                {attivitaItem?.nome || 'Non specificata'}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Dipendente:</span>
              <div className="mt-1 flex items-center gap-2">
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
                {!dipendente && (
                  <span className="text-muted-foreground">Non assegnato</span>
                )}
              </div>
            </div>

            <div className="flex justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <IconCalendar className="h-3 w-3" />
                {formatDate(intervento.dataInizio)} -{' '}
                {formatDate(intervento.dataFine)}
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
  );
};

const createInterventiColumns = (
  stati: Stato[],
  clienti: Cliente[],
  attivita: Attivita[],
  utenti: Utente[],
  onRowClick: (item: Intervento) => void,
  onDelete: (id: number) => void
): ColumnDef<Intervento>[] => [
  {
    id: 'id',
    accessorKey: 'codice',
    header: () => <div className="pl-4">ID</div>,
    cell: ({ row }) => {
      const intervento = row.original;
      return (
        <div className="flex items-center">
          <div className="w-4 flex-shrink-0">
            {intervento.urgente && (
              <div className="h-2 w-2 rounded-full bg-red-500" />
            )}
          </div>
          <span className="font-medium text-[0.75rem]">
            {intervento.codice}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'descrizione',
    header: 'Descrizione',
    cell: ({ row }) => {
      const intervento = row.original;
      const attivitaItem = attivita.find((a) => a.id === intervento.attivitaId);

      // Tronca la descrizione se è troppo lunga
      const maxLength = 50;
      const isTruncated = intervento.descrizione.length > maxLength;
      const truncatedText = isTruncated
        ? intervento.descrizione.substring(0, maxLength) + '...'
        : intervento.descrizione;

      const descriptionContent = (
        <div className="flex items-center gap-2">
          {attivitaItem && (
            <Pill
              className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
              style={{
                borderWidth: '1px',
                fontWeight: '500',
              }}
              variant="outline"
            >
              {attivitaItem.nome}
            </Pill>
          )}
          <span className="font-medium">{truncatedText}</span>
        </div>
      );

      // Se il testo è troncato, mostra il tooltip
      if (isTruncated) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">{descriptionContent}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{intervento.descrizione}</p>
            </TooltipContent>
          </Tooltip>
        );
      }

      return descriptionContent;
    },
  },
  {
    accessorKey: 'clienteId',
    header: 'Cliente',
    cell: ({ row }) => {
      const cliente = clienti.find((c) => c.id === row.original.clienteId);
      if (!cliente) return <span className="text-muted-foreground">—</span>;

      return <div className="text-[0.75rem]">{cliente.nome}</div>;
    },
  },
  {
    accessorKey: 'statoId',
    header: 'Stato',
    cell: ({ row }) => {
      const stato = stati.find((s) => s.id === row.original.statoId);
      if (!stato) return <span className="text-muted-foreground">—</span>;

      return (
        <Pill
          className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
          style={{
            borderWidth: '1px',
            fontWeight: '500',
          }}
          variant="outline"
        >
          <div
            className="mr-2 h-2 w-2 rounded-full"
            style={{ backgroundColor: stato.colore }}
          />
          <span>{stato.nome}</span>
        </Pill>
      );
    },
  },
  {
    accessorKey: 'dipendenteId',
    header: 'Dipendente',
    cell: ({ row }) => {
      const dipendente = utenti.find((u) => u.id === row.original.dipendenteId);
      if (!dipendente)
        return <span className="text-muted-foreground">Non assegnato</span>;

      return (
        <Pill
          className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
          style={{
            borderWidth: '1px',
            fontWeight: '500',
          }}
          variant="outline"
        >
          <PillAvatar
            fallback={getInitials(dipendente.nome, dipendente.cognome)}
            src={dipendente.avatar}
          />
          <span>
            {dipendente.nome} {dipendente.cognome}
          </span>
        </Pill>
      );
    },
  },
  {
    accessorKey: 'dataInizio',
    header: 'Data',
    cell: ({ row }) => {
      const intervento = row.original;
      const dataInizio = intervento.dataInizio;
      const dataFine = intervento.dataFine;

      // Se non c'è data di fine o le date coincidono, mostra solo data di inizio
      if (!dataFine || dataInizio === dataFine) {
        return (
          <div className="text-sm">
            <div>{formatDate(dataInizio)}</div>
          </div>
        );
      }

      // Altrimenti mostra entrambe le date
      return (
        <div className="text-sm">
          <div>{formatDate(dataInizio)}</div>
          <div className="text-muted-foreground text-xs">
            → {formatDate(dataFine)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'durata',
    header: 'Durata',
    cell: ({ row }) => {
      const durata = row.original.durata;
      if (!durata) return <span className="text-muted-foreground">—</span>;

      // Formatta la durata da HH:MM a formato leggibile
      const formatDuration = (duration: string): string => {
        if (!(duration && duration.includes(':'))) return duration;

        const [hours, minutes] = duration.split(':');
        const h = Number.parseInt(hours, 10);
        const m = Number.parseInt(minutes, 10);

        if (h === 0 && m === 0) return '—';
        if (h === 0) return `${m}min`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}min`;
      };

      return <span className="text-sm">{formatDuration(durata)}</span>;
    },
  },
  {
    id: 'actions',
    header: 'Azioni',
    cell: ({ row }) => {
      const intervento = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
              variant="ghost"
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
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(intervento.id)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Home() {
  // Stati principali
  const [interventi, setInterventi] = useState<Intervento[]>([]);
  const [stati, setStati] = useState<Stato[]>([]);
  const [attivita, setAttivita] = useState<Attivita[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<Utente[]>([]);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Intervento | null>(null);

  // Stato per ricerca e filtri
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );

  const [formData, setFormData] = useState({
    descrizione: '',
    attivitaId: '',
    clienteId: '',
    statoId: '',
    urgente: false,
    dipendenteId: '',
    dateRange: undefined as DateRange | undefined,
    durata: '',
    note: '',
    allegati: [] as File[],
    uploadedAllegati: [] as Allegato[],
  });

  const { isLoading, isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();

  // Caricamento dati da localStorage
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = () => {
      try {
        // Carica Stati
        const savedStati = localStorage.getItem('zentask_stati');
        if (savedStati) {
          setStati(JSON.parse(savedStati));
        }

        // Carica Attività
        const savedAttivita = localStorage.getItem('zentask_attivita_v2');
        if (savedAttivita) {
          setAttivita(JSON.parse(savedAttivita));
        }

        // Carica Clienti
        const savedClienti = localStorage.getItem('zentask_clienti');
        if (savedClienti) {
          setClienti(JSON.parse(savedClienti));
        }

        // Carica Utenti
        const savedUtenti = localStorage.getItem('zentask_utenti');
        if (savedUtenti) {
          setUtenti(JSON.parse(savedUtenti));
        }

        // Carica Interventi
        const savedInterventi = localStorage.getItem('zentask_interventi');
        if (savedInterventi) {
          setInterventi(JSON.parse(savedInterventi));
        } else {
          // Dati di esempio se non ci sono interventi salvati
          const defaultInterventi: Intervento[] = [];
          setInterventi(defaultInterventi);
          localStorage.setItem(
            'zentask_interventi',
            JSON.stringify(defaultInterventi)
          );
        }
      } catch (error) {
        console.error('Errore caricamento dati:', error);
        setInterventi([]);
      }
      setDataLoaded(true);
    };

    loadData();
  }, [isAuthenticated]);

  // Configurazione filtri
  const filters: FilterOption[] = [
    {
      key: 'statoId',
      label: 'Stato',
      options: [
        ...stati.map((stato) => ({
          value: stato.id.toString(),
          label: stato.nome,
        })),
      ],
    },
    {
      key: 'urgente',
      label: 'Priorità',
      options: [
        { value: 'true', label: 'Urgente' },
        { value: 'false', label: 'Normale' },
      ],
    },
    {
      key: 'attivitaId',
      label: 'Attività',
      options: [
        ...attivita.map((att) => ({
          value: att.id.toString(),
          label: att.nome,
        })),
      ],
    },
    {
      key: 'dipendenteId',
      label: 'Dipendente',
      options: [
        ...utenti
          .filter((u) => u.ruolo === 'operatore')
          .map((utente) => ({
            value: utente.id.toString(),
            label: `${utente.nome} ${utente.cognome}`,
          })),
      ],
    },
  ];

  // Handle row click per edit
  const handleRowClick = (item: Intervento) => {
    setEditingItem(item);
    const dateRange: DateRange | undefined =
      item.dataInizio && item.dataFine
        ? { from: new Date(item.dataInizio), to: new Date(item.dataFine) }
        : undefined;

    setFormData({
      descrizione: item.descrizione,
      attivitaId: item.attivitaId.toString(),
      clienteId: item.clienteId.toString(),
      statoId: item.statoId.toString(),
      urgente: item.urgente,
      dipendenteId: item.dipendenteId.toString(),
      dateRange,
      durata: item.durata,
      note: item.note,
      allegati: [],
      uploadedAllegati: item.allegati || [],
    });
    setIsSheetOpen(true);
  };

  // Gestione dei filtri
  const handleFilterChange = (key: string, value: string | null) => {
    setActiveFilters((prev) => {
      if (value === null || value === '__all__') {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  // Gestione upload
  const handleUpload: FileUploadProps['onUpload'] = async (
    files,
    { onProgress, onSuccess, onError }
  ) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      // Inizia sempre con 0% per mostrare la progress bar
      onProgress(file, 0);

      // Simula progress graduale per rendere visibile l'animazione (più lento)
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        if (simulatedProgress < 80) {
          simulatedProgress += Math.random() * 10 + 3; // Incremento casuale tra 3-13%
          onProgress(file, Math.min(simulatedProgress, 80));
        }
      }, 200); // Aggiorna ogni 200ms (più lento)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const realProgress = Math.round((event.loaded / event.total) * 100);
          // Usa il progresso reale se è maggiore di quello simulato
          if (realProgress > simulatedProgress) {
            simulatedProgress = realProgress;
            onProgress(file, realProgress);
          }
        }
      };

      xhr.onload = async () => {
        clearInterval(progressInterval); // Ferma la simulazione

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              // Animazione finale da 80% a 100% (più lenta)
              for (
                let progress = Math.max(simulatedProgress, 80);
                progress <= 100;
                progress += 1
              ) {
                onProgress(file, progress);
                await new Promise((resolve) => setTimeout(resolve, 30));
              }

              // Mantieni il 100% visibile per un momento più lungo
              await new Promise((resolve) => setTimeout(resolve, 500));

              setFormData((prev) => ({
                ...prev,
                uploadedAllegati: [
                  ...prev.uploadedAllegati,
                  {
                    name: file.name,
                    url: data.url,
                    size: file.size,
                    type: file.type,
                  },
                ],
                allegati: prev.allegati.filter((f) => f !== file),
              }));
              onSuccess(file);
            } else {
              throw new Error(data.error || 'Upload failed.');
            }
          } catch (e) {
            onError(
              file,
              e instanceof Error
                ? e
                : new Error('Failed to parse server response.')
            );
          }
        } else {
          onError(file, new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        clearInterval(progressInterval);
        onError(file, new Error('An error occurred during the upload.'));
      };

      xhr.send(formData);
    }
  };

  // Gestione eliminazione
  const handleDelete = (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo intervento?')) {
      try {
        const updatedInterventi = interventi.filter((item) => item.id !== id);
        localStorage.setItem(
          'zentask_interventi',
          JSON.stringify(updatedInterventi)
        );
        setInterventi(updatedInterventi);
        toast.success('Intervento eliminato con successo');
      } catch (error) {
        console.error('Errore eliminazione:', error);
        toast.error("Errore durante l'eliminazione");
      }
    }
  };

  // Filtraggio dei dati
  const filteredInterventi = interventi.filter((intervento) => {
    // Filtro per ricerca
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const cliente = clienti.find((c) => c.id === intervento.clienteId);
      const attivitaItem = attivita.find((a) => a.id === intervento.attivitaId);
      const dipendente = utenti.find((u) => u.id === intervento.dipendenteId);

      if (
        !(
          intervento.codice.toLowerCase().includes(searchLower) ||
          intervento.descrizione.toLowerCase().includes(searchLower) ||
          (cliente?.nome || '').toLowerCase().includes(searchLower) ||
          (attivitaItem?.nome || '').toLowerCase().includes(searchLower) ||
          (dipendente ? `${dipendente.nome} ${dipendente.cognome}` : '')
            .toLowerCase()
            .includes(searchLower) ||
          intervento.note.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }
    }

    // Filtri specifici
    if (
      activeFilters.statoId &&
      intervento.statoId.toString() !== activeFilters.statoId
    ) {
      return false;
    }

    if (
      activeFilters.urgente &&
      intervento.urgente.toString() !== activeFilters.urgente
    ) {
      return false;
    }

    if (
      activeFilters.attivitaId &&
      intervento.attivitaId.toString() !== activeFilters.attivitaId
    ) {
      return false;
    }

    if (
      activeFilters.dipendenteId &&
      intervento.dipendenteId.toString() !== activeFilters.dipendenteId
    ) {
      return false;
    }

    return true;
  });

  // Crea colonne con gestori
  const columns = createInterventiColumns(
    stati,
    clienti,
    attivita,
    utenti,
    handleRowClick,
    handleDelete
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descrizione.trim()) {
      toast.error('La descrizione è obbligatoria');
      return;
    }

    if (!formData.attivitaId) {
      toast.error("Seleziona un'attività");
      return;
    }

    if (!formData.clienteId) {
      toast.error('Seleziona un cliente');
      return;
    }

    if (!formData.statoId) {
      toast.error('Seleziona uno stato');
      return;
    }

    if (!formData.dipendenteId) {
      toast.error('Seleziona un dipendente');
      return;
    }

    if (!formData.dateRange?.from) {
      toast.error('La data di inizio è obbligatoria');
      return;
    }

    // Data di fine non più obbligatoria - può essere uguale alla data di inizio

    if (
      formData.dateRange.to &&
      formData.dateRange.to < formData.dateRange.from
    ) {
      toast.error('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    try {
      const finalAllegati = formData.uploadedAllegati;

      if (editingItem) {
        // Modifica intervento esistente
        const updatedInterventi = interventi.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                descrizione: formData.descrizione.trim(),
                attivitaId: Number.parseInt(formData.attivitaId),
                clienteId: Number.parseInt(formData.clienteId),
                statoId: Number.parseInt(formData.statoId),
                urgente: formData.urgente,
                dipendenteId: Number.parseInt(formData.dipendenteId),
                dataInizio:
                  formData.dateRange?.from?.toISOString().split('T')[0] || '',
                dataFine:
                  formData.dateRange?.to?.toISOString().split('T')[0] ||
                  formData.dateRange?.from?.toISOString().split('T')[0] ||
                  '',
                durata: formData.durata,
                note: formData.note,
                allegati: finalAllegati,
              }
            : item
        );

        localStorage.setItem(
          'zentask_interventi',
          JSON.stringify(updatedInterventi)
        );
        setInterventi(updatedInterventi);
        toast.success('Intervento aggiornato con successo!');
      } else {
        // Crea nuovo intervento
        const newId = Math.max(...interventi.map((i) => i.id), 0) + 1;
        const newIntervento: Intervento = {
          id: newId,
          codice: generateCodiceIntervento(newId),
          descrizione: formData.descrizione.trim(),
          attivitaId: Number.parseInt(formData.attivitaId),
          clienteId: Number.parseInt(formData.clienteId),
          statoId: Number.parseInt(formData.statoId),
          urgente: formData.urgente,
          dipendenteId: Number.parseInt(formData.dipendenteId),
          dataInizio:
            formData.dateRange?.from?.toISOString().split('T')[0] || '',
          dataFine:
            formData.dateRange?.to?.toISOString().split('T')[0] ||
            formData.dateRange?.from?.toISOString().split('T')[0] ||
            '',
          durata: formData.durata,
          note: formData.note,
          allegati: finalAllegati,
          createdAt: new Date().toISOString(),
        };

        const updatedInterventi = [...interventi, newIntervento];
        localStorage.setItem(
          'zentask_interventi',
          JSON.stringify(updatedInterventi)
        );
        setInterventi(updatedInterventi);
        toast.success('Nuovo intervento creato con successo!');
      }

      // Reset form e chiudi sheet
      setFormData({
        descrizione: '',
        attivitaId: '',
        clienteId: '',
        statoId: '',
        urgente: false,
        dipendenteId: '',
        dateRange: undefined,
        durata: '',
        note: '',
        allegati: [],
        uploadedAllegati: [],
      });
      setIsSheetOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleOpenSheet = () => {
    setEditingItem(null);

    // Default: Stato "Aperto" e data di inizio oggi
    const statoAperto = stati.find((s) => s.nome === 'Aperto');
    const oggi = new Date();

    // Trova l'utente attualmente loggato nei dati utenti
    const currentUser = utenti.find((u) => u.email === user?.email);

    setFormData({
      descrizione: '',
      attivitaId: '',
      clienteId: '',
      statoId: statoAperto ? statoAperto.id.toString() : '',
      urgente: false,
      dipendenteId: currentUser ? currentUser.id.toString() : '',
      dateRange: { from: oggi, to: undefined },
      durata: '',
      note: '',
      allegati: [],
      uploadedAllegati: [],
    });
    setIsSheetOpen(true);
  };

  if (isLoading || !isAuthenticated || !dataLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageLayout
        description="Gestisci e monitora tutti i tuoi interventi da un'unica dashboard centrale."
        title="Interventi"
      >
        <GenericDataTable
          columns={columns}
          data={interventi}
          emptyStateAction={
            <Button className="mt-2" onClick={handleOpenSheet}>
              <IconPlus className="mr-2 h-4 w-4" />
              Crea primo intervento
            </Button>
          }
          emptyStateDescription="Inizia creando il tuo primo intervento per gestire le attività del progetto."
          emptyStateTitle="Nessun intervento presente"
          filteredData={filteredInterventi}
          itemName="interventi"
          mobileCardRender={(item, onClick) =>
            renderInterventoCard(
              item,
              stati,
              clienti,
              attivita,
              utenti,
              onClick
            )
          }
          onRowClick={handleRowClick}
          toolbar={
            <DataTableToolbar
              actionButton={
                <Button onClick={handleOpenSheet}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Nuovo Intervento
                </Button>
              }
              activeFilters={activeFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchValue}
              searchPlaceholder="Cerca interventi..."
              searchValue={searchValue}
            />
          }
        />
      </PageLayout>

      {/* Form Sheet per Creazione/Modifica */}
      <StandardFormSheet
        description={
          editingItem
            ? "Modifica i dettagli dell'intervento"
            : 'Crea un nuovo intervento compilando tutti i campi richiesti'
        }
        onCancel={() => setIsSheetOpen(false)}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleSubmit}
        open={isSheetOpen}
        submitText={editingItem ? 'Salva Modifiche' : 'Crea Intervento'}
        title={editingItem ? editingItem.codice : 'Nuovo Intervento'}
      >
        <div className="space-y-5">
          <FormField htmlFor="descrizione" label="Descrizione" required>
            <Input
              id="descrizione"
              onChange={(e) =>
                setFormData({ ...formData, descrizione: e.target.value })
              }
              placeholder="Breve descrizione dell'intervento"
              required
              value={formData.descrizione}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="attivitaId" label="Attività" required>
              <Combobox
                className="w-full"
                emptyText="Nessuna attività trovata"
                onValueChange={(value) =>
                  setFormData({ ...formData, attivitaId: value })
                }
                options={attivita.map((att) => ({
                  value: att.id.toString(),
                  label: att.nome,
                }))}
                placeholder="Seleziona attività"
                searchPlaceholder="Cerca attività..."
                showCheck={false}
                useDrawerOnMobile={true}
                value={formData.attivitaId}
              />
            </FormField>

            <FormField htmlFor="clienteId" label="Cliente" required>
              <Combobox
                className="w-full"
                emptyText="Nessun cliente trovato"
                onValueChange={(value) =>
                  setFormData({ ...formData, clienteId: value })
                }
                options={clienti.map((cliente) => ({
                  value: cliente.id.toString(),
                  label: cliente.nome,
                }))}
                placeholder="Seleziona cliente"
                searchPlaceholder="Cerca cliente..."
                showCheck={false}
                showIcon={false}
                useDrawerOnMobile={true}
                value={formData.clienteId}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="statoId" label="Stato" required>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, statoId: value })
                }
                value={formData.statoId}
              >
                <SelectTrigger className="w-full" id="statoId">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  {stati.map((stato) => (
                    <SelectItem key={stato.id} value={stato.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: stato.colore }}
                        />
                        {stato.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField htmlFor="dipendenteId" label="Dipendente" required>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, dipendenteId: value })
                }
                value={formData.dipendenteId}
              >
                <SelectTrigger className="w-full" id="dipendenteId">
                  <SelectValue placeholder="Seleziona dipendente" />
                </SelectTrigger>
                <SelectContent>
                  {utenti
                    .filter((u) => u.ruolo === 'operatore')
                    .map((utente) => (
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

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <Label
                className="flex items-center gap-2 font-medium text-sm"
                htmlFor="urgente"
              >
                <span className="text-red-500">
                  <IconAlertTriangle className="h-4 w-4" />
                </span>
                Urgente
              </Label>
              <Switch
                checked={formData.urgente}
                className="data-[state=checked]:bg-red-500"
                id="urgente"
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, urgente: checked as boolean })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="dateRange" label="Date Intervento" required>
              <DateRangePicker
                onChange={(range) =>
                  setFormData({ ...formData, dateRange: range })
                }
                placeholder="Seleziona date intervento"
                value={formData.dateRange}
              />
            </FormField>

            <FormField htmlFor="durata" label="Durata">
              <DurationPicker
                onChange={(value) =>
                  setFormData({ ...formData, durata: value })
                }
                value={formData.durata}
              />
            </FormField>
          </div>

          <FormField htmlFor="note" label="Note">
            <Textarea
              id="note"
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Note aggiuntive, dettagli tecnici o commenti..."
              rows={3}
              value={formData.note}
            />
          </FormField>

          <FileUploadFormField
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar"
            existingFiles={formData.uploadedAllegati}
            files={formData.allegati}
            label="Allegati"
            maxSize={10 * 1024 * 1024} // 10MB
            onFilesChange={(files: File[]) =>
              setFormData({ ...formData, allegati: files })
            }
            onRemoveExisting={(index) => {
              setFormData((prev) => ({
                ...prev,
                uploadedAllegati: prev.uploadedAllegati.filter(
                  (_, i) => i !== index
                ),
              }));
            }}
            onUpload={handleUpload}
            uploadDescription="Trascina i file qui o clicca per sfogliare"
            uploadLabel="Upload allegati"
          />
        </div>
      </StandardFormSheet>

      {/* FAB for mobile */}
      {isMobile && (
        <Button
          className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg sm:hidden"
          onClick={handleOpenSheet}
          size="icon"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
