'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  showCheck?: boolean;
  useDrawerOnMobile?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No option found.',
  className,
  disabled = false,
  showIcon = true,
  showCheck = true,
  useDrawerOnMobile = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const selectedOption = options.find((option) => option.value === value);

  const CommandContent = () => (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              onSelect={(currentValue) => {
                const newValue = currentValue === value ? '' : currentValue;
                onValueChange?.(newValue);
                setOpen(false);
              }}
              value={option.value}
            >
              {showCheck && (
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const TriggerButton = ({ asChild = false, ...props }) => (
    <Button
      aria-expanded={open}
      className={cn('w-full justify-between', className)}
      disabled={disabled}
      role="combobox"
      variant="outline"
      {...(asChild ? {} : props)}
    >
      {selectedOption ? selectedOption.label : placeholder}
      {showIcon && (
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      )}
    </Button>
  );

  if (isMobile && useDrawerOnMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <TriggerButton />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Seleziona un'opzione</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <CommandContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <TriggerButton />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <CommandContent />
      </PopoverContent>
    </Popover>
  );
}
