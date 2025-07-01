'use client';

import { addDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleziona intervallo date',
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onChange?.(range);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) return placeholder;

    if (range.from) {
      if (range.to) {
        return `${format(range.from, 'dd/MM/yyyy', { locale: it })} - ${format(range.to, 'dd/MM/yyyy', { locale: it })}`;
      }
      return format(range.from, 'dd/MM/yyyy', { locale: it });
    }

    return placeholder;
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
            disabled={disabled}
            id="date"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={date?.from}
            initialFocus
            locale={it}
            mode="range"
            numberOfMonths={2}
            onSelect={handleSelect}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
