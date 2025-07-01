import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface StandardFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText: string;
  cancelText?: string;
  children: ReactNode;
  trigger?: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  forceSide?: boolean;
}

export function StandardFormSheet({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  submitText,
  cancelText = 'Annulla',
  children,
  trigger,
  side = 'right',
  forceSide = false,
}: StandardFormSheetProps) {
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const sheetSide = forceSide ? side : isMobile ? 'bottom' : 'right';

  const content = (
    <SheetContent
      className={
        sheetSide === 'right' || sheetSide === 'left'
          ? 'w-full max-w-md sm:max-w-lg'
          : ''
      }
      side={sheetSide}
    >
      <SheetHeader className="text-left">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>

      <form
        className="flex min-w-0 flex-col gap-4 overflow-y-auto px-4 text-sm"
        id="standard-form"
        onSubmit={handleSubmit}
      >
        {children}
      </form>

      <SheetFooter>
        <Button className="w-full" form="standard-form" type="submit">
          {submitText}
        </Button>
      </SheetFooter>
    </SheetContent>
  );

  if (trigger) {
    return (
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        {content}
      </Sheet>
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      {content}
    </Sheet>
  );
}
