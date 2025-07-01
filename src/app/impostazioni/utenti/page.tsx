'use client';

import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/form-field';
import { GenericDataTable } from '@/components/generic-data-table';
import { PageLayout } from '@/components/page-layout';
import { StandardFormSheet } from '@/components/standard-form-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pill } from '@/components/ui/kibo-ui/pill';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Utente {
  id: number;
  nome: string;
  cognome: string;
  avatar?: string;
  email: string;
  ruolo: 'admin' | 'operatore';
  password: string;
}

const getInitials = (nome: string, cognome: string) => {
  return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
};

const createColumns = (
  handleEdit: (item: Utente) => void,
  handleDelete: (id: number) => void
): ColumnDef<Utente>[] => [
  {
    accessorKey: 'nome',
    header: 'Utente',
    cell: ({ row }) => {
      const utente = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={utente.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(utente.nome, utente.cognome)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {utente.nome} {utente.cognome}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.email}</div>
    ),
  },
  {
    accessorKey: 'ruolo',
    header: 'Ruolo',
    cell: ({ row }) => (
      <Pill
        className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
        style={{
          borderWidth: '1px',
          fontWeight: '500',
        }}
        variant="outline"
      >
        {row.original.ruolo === 'admin' ? 'Amministratore' : 'Operatore'}
      </Pill>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const utente = row.original;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                variant="ghost"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleEdit(utente)}>
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(utente.id)}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function UtentiPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Utente | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    avatar: '',
    email: '',
    ruolo: 'operatore' as 'admin' | 'operatore',
    password: '',
  });

  const loadUtenti = () => {
    const saved = localStorage.getItem('zentask_utenti');
    if (saved) {
      setUtenti(JSON.parse(saved));
    } else {
      const defaultUtenti = [
        {
          id: 1,
          nome: 'Admin',
          cognome: 'User',
          email: 'admin@zentask.local',
          ruolo: 'admin' as const,
          password: 'admin123',
          avatar: '',
        },
        {
          id: 2,
          nome: 'Mario',
          cognome: 'Rossi',
          email: 'mario.rossi@zentask.local',
          ruolo: 'operatore' as const,
          password: 'operatore123',
          avatar: '',
        },
      ];
      setUtenti(defaultUtenti);
      localStorage.setItem('zentask_utenti', JSON.stringify(defaultUtenti));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUtenti();
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const saveUtenti = (newUtenti: Utente[]) => {
    localStorage.setItem('zentask_utenti', JSON.stringify(newUtenti));
    setUtenti(newUtenti);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('Il nome e obbligatorio');
      return;
    }

    if (!formData.cognome.trim()) {
      toast.error('Il cognome e obbligatorio');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('L email e obbligatoria');
      return;
    }

    if (!(editingItem || formData.password.trim())) {
      toast.error('La password e obbligatoria per nuovi utenti');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Formato email non valido');
      return;
    }

    const emailExists = utenti.some(
      (user) =>
        user.email.toLowerCase() === formData.email.toLowerCase() &&
        (!editingItem || user.id !== editingItem.id)
    );
    if (emailExists) {
      toast.error('Esiste gia un utente con questa email');
      return;
    }

    if (editingItem) {
      const updated = utenti.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              password: formData.password || item.password,
            }
          : item
      );
      saveUtenti(updated);
      toast.success('Utente aggiornato con successo');
    } else {
      const newId = Math.max(...utenti.map((u) => u.id), 0) + 1;
      const newUtente = { id: newId, ...formData };
      saveUtenti([...utenti, newUtente]);
      toast.success('Utente creato con successo');
    }

    setIsSheetOpen(false);
    setEditingItem(null);
    setFormData({
      nome: '',
      cognome: '',
      avatar: '',
      email: '',
      ruolo: 'operatore',
      password: '',
    });
    setShowPassword(false);
  };

  const handleEdit = (item: Utente) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      cognome: item.cognome,
      avatar: item.avatar || '',
      email: item.email,
      ruolo: item.ruolo,
      password: '',
    });
    setIsSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      const filtered = utenti.filter((item) => item.id !== id);
      saveUtenti(filtered);
      toast.success('Utente eliminato con successo');
    }
  };

  const handleOpenSheet = () => {
    setEditingItem(null);
    setFormData({
      nome: '',
      cognome: '',
      avatar: '',
      email: '',
      ruolo: 'operatore',
      password: '',
    });
    setIsSheetOpen(true);
  };

  const renderUtenteCard = (utente: Utente, onClick?: () => void) => (
    <Card
      className={`transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={utente.avatar} />
              <AvatarFallback className="text-sm">
                {getInitials(utente.nome, utente.cognome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none">
                  {utente.nome} {utente.cognome}
                </h3>
                <Pill
                  className="border-border bg-transparent px-[10px] py-[2px] font-medium text-[0.75rem] text-muted-foreground"
                  style={{
                    borderWidth: '1px',
                    fontWeight: '500',
                  }}
                  variant="outline"
                >
                  {utente.ruolo === 'admin' ? 'Amministratore' : 'Operatore'}
                </Pill>
              </div>
              <p className="text-muted-foreground text-sm">{utente.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                className="h-8 w-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
                variant="ghost"
              >
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(utente);
                }}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(utente.id);
                }}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  // Create columns with handlers
  const columns = createColumns(handleEdit, handleDelete);

  const customActionButton = (
    <Button onClick={handleOpenSheet}>
      <IconPlus className="mr-2 h-4 w-4" />
      Nuovo Utente
    </Button>
  );

  return (
    <PageLayout
      customActionButton={customActionButton}
      description="Gestisci gli utenti del sistema"
      isAdminPage={true}
      title="Utenti"
    >
      <GenericDataTable
        columns={columns}
        data={utenti}
        emptyStateAction={
          <Button className="mt-2" onClick={handleOpenSheet}>
            <IconPlus className="mr-2 h-4 w-4" />
            Aggiungi primo utente
          </Button>
        }
        emptyStateDescription="Aggiungi il primo utente per iniziare a gestire il sistema."
        emptyStateTitle="Nessun utente presente"
        mobileCardRender={renderUtenteCard}
        showItemCount={false}
      />

      {/* Form Sheet */}
      <StandardFormSheet
        description={
          editingItem
            ? "Modifica i dettagli dell'utente selezionato"
            : 'Inserisci i dettagli del nuovo utente'
        }
        onCancel={() => setIsSheetOpen(false)}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleSubmit}
        open={isSheetOpen}
        submitText={editingItem ? 'Salva Modifiche' : 'Aggiungi Utente'}
        title={editingItem ? 'Modifica Utente' : 'Nuovo Utente'}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField htmlFor="nome" label="Nome" required>
            <Input
              id="nome"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              required
              value={formData.nome}
            />
          </FormField>

          <FormField htmlFor="cognome" label="Cognome" required>
            <Input
              id="cognome"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cognome: e.target.value,
                }))
              }
              required
              value={formData.cognome}
            />
          </FormField>
        </div>

        <FormField htmlFor="email" label="Email" required>
          <Input
            id="email"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            type="email"
            value={formData.email}
          />
        </FormField>

        <FormField htmlFor="ruolo" label="Ruolo">
          <Select
            onValueChange={(value: 'admin' | 'operatore') =>
              setFormData((prev) => ({ ...prev, ruolo: value }))
            }
            value={formData.ruolo}
          >
            <SelectTrigger id="ruolo">
              <SelectValue placeholder="Seleziona un ruolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Amministratore</SelectItem>
              <SelectItem value="operatore">Operatore</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          description={
            editingItem ? 'Lascia vuoto per non modificare' : undefined
          }
          htmlFor="password"
          label="Password"
          required={!editingItem}
        >
          <div className="relative">
            <Input
              id="password"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required={!editingItem}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
            />
            <Button
              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </FormField>
      </StandardFormSheet>
    </PageLayout>
  );
}
