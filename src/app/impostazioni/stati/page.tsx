'use client';

import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ColorPicker } from '@/components/color-picker';
import { FormField } from '@/components/form-field';
import { GenericDataTable } from '@/components/generic-data-table';
import { PageLayout } from '@/components/page-layout';
import { StandardFormSheet } from '@/components/standard-form-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/kibo-ui/pill';
import { useAuth } from '@/contexts/AuthContext';

interface Stato {
  id: number;
  nome: string;
  colore: string;
}

const STATI_DEFAULT: Stato[] = [
  { id: 1, nome: 'Da fare', colore: '#ef4444' },
  { id: 2, nome: 'In corso', colore: '#eab308' },
  { id: 3, nome: 'Completato', colore: '#22c55e' },
  { id: 4, nome: 'Sospeso', colore: '#f97316' },
  { id: 5, nome: 'Annullato', colore: '#6b7280' },
];

function createColumns(
  onEdit: (stato: Stato) => void,
  onDelete: (id: number) => void
): ColumnDef<Stato>[] {
  return [
    {
      accessorKey: 'nome',
      header: 'Nome Stato',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('nome')}</div>
      ),
    },
    {
      accessorKey: 'colore',
      header: 'Colore',
      cell: ({ row }) => {
        const colore = row.getValue('colore') as string;
        const nome = row.getValue('nome') as string;
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
              style={{ backgroundColor: colore }}
            />
            <span>{nome}</span>
          </Pill>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const stato = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(stato)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(stato.id)}
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
}

export default function StatiPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [stati, setStati] = useState<Stato[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingStato, setEditingStato] = useState<Stato | null>(null);

  // Form states
  const [formNome, setFormNome] = useState('');
  const [formColore, setFormColore] = useState('#3b82f6');

  const loadStati = () => {
    const saved = localStorage.getItem('zentask_stati');
    if (saved) {
      try {
        setStati(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading stati:', error);
        setStati(STATI_DEFAULT);
        localStorage.setItem('zentask_stati', JSON.stringify(STATI_DEFAULT));
      }
    } else {
      setStati(STATI_DEFAULT);
      localStorage.setItem('zentask_stati', JSON.stringify(STATI_DEFAULT));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStati();
    }
  }, [isAuthenticated]);

  const saveStati = (newStati: Stato[]) => {
    setStati(newStati);
    localStorage.setItem('zentask_stati', JSON.stringify(newStati));
  };

  const handleAdd = () => {
    if (!formNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }

    const newStato: Stato = {
      id: Date.now(),
      nome: formNome.trim(),
      colore: formColore,
    };

    saveStati([...stati, newStato]);
    setFormNome('');
    setFormColore('#3b82f6');
    setIsAddSheetOpen(false);
    toast.success('Stato creato con successo');
  };

  const handleEdit = (stato: Stato) => {
    setEditingStato(stato);
    setFormNome(stato.nome);
    setFormColore(stato.colore);
    setIsEditSheetOpen(true);
  };

  const handleUpdate = () => {
    if (!formNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }

    if (!editingStato) return;

    const updated = stati.map((stato) =>
      stato.id === editingStato.id
        ? { ...stato, nome: formNome.trim(), colore: formColore }
        : stato
    );

    saveStati(updated);
    setFormNome('');
    setFormColore('#3b82f6');
    setEditingStato(null);
    setIsEditSheetOpen(false);
    toast.success('Stato aggiornato con successo');
  };

  const handleDelete = (id: number) => {
    const updated = stati.filter((stato) => stato.id !== id);
    saveStati(updated);
    toast.success('Stato eliminato con successo');
  };

  const resetForm = () => {
    setFormNome('');
    setFormColore('#3b82f6');
    setEditingStato(null);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <PageLayout
      customActionButton={
        <Button
          onClick={() => {
            resetForm();
            setIsAddSheetOpen(true);
          }}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nuovo Stato
        </Button>
      }
      description="Gestisci gli stati degli interventi"
      isAdminPage={true}
      title="Stati"
    >
      <GenericDataTable
        columns={columns}
        data={stati}
        emptyStateAction={
          <Button
            className="mt-2"
            onClick={() => {
              resetForm();
              setIsAddSheetOpen(true);
            }}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Crea primo stato
          </Button>
        }
        emptyStateDescription="Crea il primo stato per organizzare i tuoi interventi."
        emptyStateTitle="Nessuno stato presente"
        showItemCount={false}
      />

      {/* Add Form Sheet */}
      <StandardFormSheet
        description="Crea un nuovo stato per gli interventi"
        onCancel={() => setIsAddSheetOpen(false)}
        onOpenChange={setIsAddSheetOpen}
        onSubmit={handleAdd}
        open={isAddSheetOpen}
        submitText="Crea Stato"
        title="Nuovo Stato"
      >
        <FormField htmlFor="add-nome" label="Nome Stato" required>
          <Input
            id="add-nome"
            onChange={(e) => setFormNome(e.target.value)}
            placeholder="Es. In revisione"
            required
            value={formNome}
          />
        </FormField>

        <FormField htmlFor="add-colore" label="Colore">
          <ColorPicker onChange={setFormColore} value={formColore} />
        </FormField>
      </StandardFormSheet>

      {/* Edit Form Sheet */}
      <StandardFormSheet
        description="Modifica le informazioni dello stato selezionato"
        onCancel={() => setIsEditSheetOpen(false)}
        onOpenChange={setIsEditSheetOpen}
        onSubmit={handleUpdate}
        open={isEditSheetOpen}
        submitText="Salva Modifiche"
        title="Modifica Stato"
      >
        <FormField htmlFor="edit-nome" label="Nome Stato" required>
          <Input
            id="edit-nome"
            onChange={(e) => setFormNome(e.target.value)}
            placeholder="Es. In revisione"
            required
            value={formNome}
          />
        </FormField>

        <FormField htmlFor="edit-colore" label="Colore">
          <ColorPicker onChange={setFormColore} value={formColore} />
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  );
}
