'use client';

import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ColorPicker } from '@/components/color-picker';
import { FormField } from '@/components/form-field';
import { GenericDataTable } from '@/components/generic-data-table';
import { PageLayout } from '@/components/page-layout';
import { StandardFormSheet } from '@/components/standard-form-sheet';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/kibo-ui/pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface Attivita {
  id: number;
  nome: string;
  categoria: string;
}

interface Categoria {
  id: string;
  nome: string;
  colore: string;
}

const CATEGORIE_DEFAULT: Categoria[] = [
  { id: 'LAB', nome: 'Laboratorio', colore: '#ef4444' },
  { id: 'COM', nome: 'Commerciale', colore: '#22c55e' },
  { id: 'WEB', nome: 'Sviluppo Web', colore: '#3b82f6' },
];

const ATTIVITA_DEFAULT: Attivita[] = [
  { id: 1, nome: 'Installazione Software', categoria: 'LAB' },
  { id: 2, nome: 'Riparazione Hardware', categoria: 'LAB' },
  { id: 3, nome: 'Consulenza', categoria: 'COM' },
  { id: 4, nome: 'Preventivo', categoria: 'COM' },
  { id: 5, nome: 'Sviluppo Sito Web', categoria: 'WEB' },
  { id: 6, nome: 'Manutenzione Sito', categoria: 'WEB' },
];

function createAttivitaColumns(
  categorie: Categoria[],
  onEdit: (attivita: Attivita) => void,
  onDelete: (id: number) => void
): ColumnDef<Attivita>[] {
  return [
    {
      accessorKey: 'nome',
      header: 'Nome Attività',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('nome')}</div>
      ),
    },
    {
      accessorKey: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => {
        const categoriaId = row.getValue('categoria') as string;
        const categoria = categorie.find((c) => c.id === categoriaId);
        if (!categoria) {
          return (
            <Pill
              className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
              style={{
                borderWidth: '1px',
                fontWeight: '500',
              }}
              variant="outline"
            >
              Sconosciuto
            </Pill>
          );
        }
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
              style={{ backgroundColor: categoria.colore }}
            />
            <span>
              {categoria.id}: {categoria.nome}
            </span>
          </Pill>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const attivita = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(attivita)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(attivita.id)}
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

export default function AttivitaPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [attivita, setAttivita] = useState<Attivita[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);

  // Activity states
  const [isAddAttivitaSheetOpen, setIsAddAttivitaSheetOpen] = useState(false);
  const [isEditAttivitaSheetOpen, setIsEditAttivitaSheetOpen] = useState(false);
  const [editingAttivita, setEditingAttivita] = useState<Attivita | null>(null);
  const [formAttivitaNome, setFormAttivitaNome] = useState('');
  const [formAttivitaCategoria, setFormAttivitaCategoria] = useState('');

  const loadCategorie = () => {
    const saved = localStorage.getItem('zentask_categorie_v2');
    if (saved) {
      try {
        setCategorie(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading categorie:', error);
        setCategorie(CATEGORIE_DEFAULT);
        localStorage.setItem(
          'zentask_categorie_v2',
          JSON.stringify(CATEGORIE_DEFAULT)
        );
      }
    } else {
      setCategorie(CATEGORIE_DEFAULT);
      localStorage.setItem(
        'zentask_categorie_v2',
        JSON.stringify(CATEGORIE_DEFAULT)
      );
    }
  };

  const loadAttivita = () => {
    const saved = localStorage.getItem('zentask_attivita_v2');
    if (saved) {
      try {
        setAttivita(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading attivita:', error);
        setAttivita(ATTIVITA_DEFAULT);
        localStorage.setItem(
          'zentask_attivita_v2',
          JSON.stringify(ATTIVITA_DEFAULT)
        );
      }
    } else {
      setAttivita(ATTIVITA_DEFAULT);
      localStorage.setItem(
        'zentask_attivita_v2',
        JSON.stringify(ATTIVITA_DEFAULT)
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCategorie();
      loadAttivita();
    }
  }, [isAuthenticated]);

  const saveAttivita = (newAttivita: Attivita[]) => {
    setAttivita(newAttivita);
    localStorage.setItem('zentask_attivita_v2', JSON.stringify(newAttivita));
  };

  const saveCategorie = (newCategorie: Categoria[]) => {
    setCategorie(newCategorie);
    localStorage.setItem('zentask_categorie_v2', JSON.stringify(newCategorie));
  };

  // Activity handlers
  const handleAddAttivita = () => {
    if (!formAttivitaNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }
    if (!formAttivitaCategoria) {
      toast.error('La categoria è obbligatoria');
      return;
    }

    const newAttivita: Attivita = {
      id: Date.now(),
      nome: formAttivitaNome.trim(),
      categoria: formAttivitaCategoria,
    };

    saveAttivita([...attivita, newAttivita]);
    setFormAttivitaNome('');
    setFormAttivitaCategoria('');
    setIsAddAttivitaSheetOpen(false);
    toast.success('Attività creata con successo');
  };

  const handleEditAttivita = (attivita: Attivita) => {
    setEditingAttivita(attivita);
    setFormAttivitaNome(attivita.nome);
    setFormAttivitaCategoria(attivita.categoria);
    setIsEditAttivitaSheetOpen(true);
  };

  const handleUpdateAttivita = () => {
    if (!formAttivitaNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }
    if (!formAttivitaCategoria) {
      toast.error('La categoria è obbligatoria');
      return;
    }

    if (!editingAttivita) return;

    const updated = attivita.map((item) =>
      item.id === editingAttivita.id
        ? {
            ...item,
            nome: formAttivitaNome.trim(),
            categoria: formAttivitaCategoria,
          }
        : item
    );

    saveAttivita(updated);
    setFormAttivitaNome('');
    setFormAttivitaCategoria('');
    setEditingAttivita(null);
    setIsEditAttivitaSheetOpen(false);
    toast.success('Attività aggiornata con successo');
  };

  const handleDeleteAttivita = (id: number) => {
    const updated = attivita.filter((item) => item.id !== id);
    saveAttivita(updated);
    toast.success('Attività eliminata con successo');
  };

  const resetAttivitaForm = () => {
    setFormAttivitaNome('');
    setFormAttivitaCategoria('');
    setEditingAttivita(null);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const attivitaColumns = createAttivitaColumns(
    categorie,
    handleEditAttivita,
    handleDeleteAttivita
  );

  const customActionButton = (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          resetAttivitaForm();
          setIsAddAttivitaSheetOpen(true);
        }}
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Nuova Attività
      </Button>

      <Button asChild variant="outline">
        <Link href="/impostazioni/attivita/categorie">
          <IconSettings className="mr-2 h-4 w-4" />
          Categorie
        </Link>
      </Button>
    </div>
  );

  return (
    <PageLayout
      customActionButton={customActionButton}
      description="Gestisci le attività degli interventi e le loro categorie"
      isAdminPage={true}
      title="Attività"
    >
      <GenericDataTable
        columns={attivitaColumns}
        data={attivita}
        emptyStateAction={
          <Button
            className="mt-2"
            onClick={() => {
              resetAttivitaForm();
              setIsAddAttivitaSheetOpen(true);
            }}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Crea prima attività
          </Button>
        }
        emptyStateDescription="Crea la prima attività per organizzare i tuoi interventi."
        emptyStateTitle="Nessuna attività presente"
        showItemCount={false}
      />

      {/* Add Form Sheet */}
      <StandardFormSheet
        description="Crea una nuova attività per gli interventi"
        onCancel={() => setIsAddAttivitaSheetOpen(false)}
        onOpenChange={setIsAddAttivitaSheetOpen}
        onSubmit={handleAddAttivita}
        open={isAddAttivitaSheetOpen}
        submitText="Crea Attività"
        title="Nuova Attività"
      >
        <FormField htmlFor="attivita-nome" label="Nome Attività" required>
          <Input
            id="attivita-nome"
            onChange={(e) => setFormAttivitaNome(e.target.value)}
            placeholder="Es. Installazione software"
            required
            value={formAttivitaNome}
          />
        </FormField>

        <FormField htmlFor="attivita-categoria" label="Categoria" required>
          <Select
            onValueChange={setFormAttivitaCategoria}
            value={formAttivitaCategoria}
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
        description="Modifica le informazioni dell'attività selezionata"
        onCancel={() => setIsEditAttivitaSheetOpen(false)}
        onOpenChange={setIsEditAttivitaSheetOpen}
        onSubmit={handleUpdateAttivita}
        open={isEditAttivitaSheetOpen}
        submitText="Salva Modifiche"
        title="Modifica Attività"
      >
        <FormField htmlFor="edit-attivita-nome" label="Nome Attività" required>
          <Input
            id="edit-attivita-nome"
            onChange={(e) => setFormAttivitaNome(e.target.value)}
            placeholder="Es. Installazione software"
            required
            value={formAttivitaNome}
          />
        </FormField>

        <FormField htmlFor="edit-attivita-categoria" label="Categoria" required>
          <Select
            onValueChange={setFormAttivitaCategoria}
            value={formAttivitaCategoria}
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
  );
}
