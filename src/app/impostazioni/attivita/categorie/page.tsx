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

function createCategorieColumns(
  onEdit: (categoria: Categoria) => void,
  onDelete: (id: string) => void
): ColumnDef<Categoria>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'nome',
      header: 'Nome Categoria',
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
        const categoria = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(categoria)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(categoria.id)}
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

export default function CategoriePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [categorie, setCategorie] = useState<Categoria[]>([]);

  // Category states
  const [isAddCategoriaSheetOpen, setIsAddCategoriaSheetOpen] = useState(false);
  const [isEditCategoriaSheetOpen, setIsEditCategoriaSheetOpen] =
    useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );
  const [formCategoriaId, setFormCategoriaId] = useState('');
  const [formCategoriaNome, setFormCategoriaNome] = useState('');
  const [formCategoriaColore, setFormCategoriaColore] = useState('#3b82f6');

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

  useEffect(() => {
    if (isAuthenticated) {
      loadCategorie();
    }
  }, [isAuthenticated]);

  const saveCategorie = (newCategorie: Categoria[]) => {
    setCategorie(newCategorie);
    localStorage.setItem('zentask_categorie_v2', JSON.stringify(newCategorie));
  };

  // Category handlers
  const handleAddCategoria = () => {
    if (!formCategoriaId.trim()) {
      toast.error("L'ID è obbligatorio");
      return;
    }
    if (!formCategoriaNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }
    if (categorie.some((c) => c.id === formCategoriaId.trim().toUpperCase())) {
      toast.error('ID già esistente');
      return;
    }

    const newCategoria: Categoria = {
      id: formCategoriaId.trim().toUpperCase(),
      nome: formCategoriaNome.trim(),
      colore: formCategoriaColore,
    };

    saveCategorie([...categorie, newCategoria]);
    setFormCategoriaId('');
    setFormCategoriaNome('');
    setFormCategoriaColore('#3b82f6');
    setIsAddCategoriaSheetOpen(false);
    toast.success('Categoria creata con successo');
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormCategoriaId(categoria.id);
    setFormCategoriaNome(categoria.nome);
    setFormCategoriaColore(categoria.colore);
    setIsEditCategoriaSheetOpen(true);
  };

  const handleUpdateCategoria = () => {
    if (!formCategoriaId.trim()) {
      toast.error("L'ID è obbligatorio");
      return;
    }
    if (!formCategoriaNome.trim()) {
      toast.error('Il nome è obbligatorio');
      return;
    }

    if (!editingCategoria) return;

    const trimmedId = formCategoriaId.trim().toUpperCase();
    if (
      trimmedId !== editingCategoria.id &&
      categorie.some((c) => c.id === trimmedId)
    ) {
      toast.error('ID già esistente');
      return;
    }

    const updated = categorie.map((item) =>
      item.id === editingCategoria.id
        ? {
            ...item,
            id: trimmedId,
            nome: formCategoriaNome.trim(),
            colore: formCategoriaColore,
          }
        : item
    );

    saveCategorie(updated);
    setFormCategoriaId('');
    setFormCategoriaNome('');
    setFormCategoriaColore('#3b82f6');
    setEditingCategoria(null);
    setIsEditCategoriaSheetOpen(false);
    toast.success('Categoria aggiornata con successo');
  };

  const handleDeleteCategoria = (id: string) => {
    const updated = categorie.filter((item) => item.id !== id);
    saveCategorie(updated);
    toast.success('Categoria eliminata con successo');
  };

  const resetCategoriaForm = () => {
    setFormCategoriaId('');
    setFormCategoriaNome('');
    setFormCategoriaColore('#3b82f6');
    setEditingCategoria(null);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const categorieColumns = createCategorieColumns(
    handleEditCategoria,
    handleDeleteCategoria
  );

  const customActionButton = (
    <Button
      onClick={() => {
        resetCategoriaForm();
        setIsAddCategoriaSheetOpen(true);
      }}
    >
      <IconPlus className="mr-2 h-4 w-4" />
      Nuova Categoria
    </Button>
  );

  return (
    <PageLayout
      customActionButton={customActionButton}
      description="Gestisci le categorie delle attività"
      isAdminPage={true}
      parentHref="/impostazioni/attivita"
      parentPage="Attività"
      showParentBreadcrumb={true}
      title="Categorie"
    >
      <GenericDataTable
        columns={categorieColumns}
        data={categorie}
        emptyStateAction={
          <Button
            className="mt-2"
            onClick={() => {
              resetCategoriaForm();
              setIsAddCategoriaSheetOpen(true);
            }}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Crea prima categoria
          </Button>
        }
        emptyStateDescription="Crea la prima categoria per organizzare le tue attività."
        emptyStateTitle="Nessuna categoria presente"
        onRowClick={handleEditCategoria}
        showItemCount={false}
      />

      <StandardFormSheet
        description="Modifica le informazioni della categoria"
        onCancel={() => setIsEditCategoriaSheetOpen(false)}
        onOpenChange={setIsEditCategoriaSheetOpen}
        onSubmit={handleUpdateCategoria}
        open={isEditCategoriaSheetOpen}
        submitText="Salva Modifiche"
        title="Modifica Categoria"
      >
        <FormField htmlFor="edit-categoria-id" label="ID Categoria" required>
          <Input
            id="edit-categoria-id"
            onChange={(e) => setFormCategoriaId(e.target.value)}
            placeholder="Es. LAB"
            required
            value={formCategoriaId}
          />
        </FormField>
        <FormField
          htmlFor="edit-categoria-nome"
          label="Nome Categoria"
          required
        >
          <Input
            id="edit-categoria-nome"
            onChange={(e) => setFormCategoriaNome(e.target.value)}
            placeholder="Es. Laboratorio"
            required
            value={formCategoriaNome}
          />
        </FormField>
        <FormField htmlFor="edit-categoria-colore" label="Colore">
          <ColorPicker
            onChange={setFormCategoriaColore}
            value={formCategoriaColore}
          />
        </FormField>
      </StandardFormSheet>

      <StandardFormSheet
        description="Crea una nuova categoria per le attività"
        onCancel={() => setIsAddCategoriaSheetOpen(false)}
        onOpenChange={setIsAddCategoriaSheetOpen}
        onSubmit={handleAddCategoria}
        open={isAddCategoriaSheetOpen}
        submitText="Crea Categoria"
        title="Nuova Categoria"
      >
        <FormField htmlFor="add-categoria-id" label="ID Categoria" required>
          <Input
            id="add-categoria-id"
            onChange={(e) => setFormCategoriaId(e.target.value)}
            placeholder="Es. LAB"
            required
            value={formCategoriaId}
          />
        </FormField>
        <FormField htmlFor="add-categoria-nome" label="Nome Categoria" required>
          <Input
            id="add-categoria-nome"
            onChange={(e) => setFormCategoriaNome(e.target.value)}
            placeholder="Es. Laboratorio"
            required
            value={formCategoriaNome}
          />
        </FormField>
        <FormField htmlFor="add-categoria-colore" label="Colore">
          <ColorPicker
            onChange={setFormCategoriaColore}
            value={formCategoriaColore}
          />
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  );
}
