"use client"

import * as React from "react"
import { TimePickerInput } from "./time-picker-input"
import { Label } from "./label"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>();

  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      if(!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date();
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        setDate(newDate);
      }
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && onChange) {
        const hours = newDate.getHours().toString().padStart(2, '0');
        const minutes = newDate.getMinutes().toString().padStart(2, '0');
        onChange(`${hours}:${minutes}`);
    } else if (onChange) {
        onChange("");
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Ore
        </Label>
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={handleDateChange}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minuti
        </Label>
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={handleDateChange}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
        />
      </div>
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
} 