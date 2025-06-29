"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimeInputProps {
  value?: string // Format: "HH:MM"
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimeInput({
  value = "",
  onChange,
  placeholder = "00:00",
  className,
  disabled = false,
}: TimeInputProps) {
  const [hours, setHours] = React.useState("")
  const [minutes, setMinutes] = React.useState("")

  // Parse initial value
  React.useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      setHours(h || "")
      setMinutes(m || "")
    } else {
      setHours("")
      setMinutes("")
    }
  }, [value])

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "") // Solo numeri
    if (val.length > 2) val = val.slice(0, 2)
    if (parseInt(val) > 23) val = "23"
    
    setHours(val)
    updateValue(val, minutes)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "") // Solo numeri
    if (val.length > 2) val = val.slice(0, 2)
    if (parseInt(val) > 59) val = "59"
    
    setMinutes(val)
    updateValue(hours, val)
  }

  const updateValue = (h: string, m: string) => {
    if (h || m) {
      const formattedHours = h.padStart(2, "0")
      const formattedMinutes = m.padStart(2, "0")
      onChange?.(`${formattedHours}:${formattedMinutes}`)
    } else {
      onChange?.("")
    }
  }

  const handleHoursBlur = () => {
    if (hours && hours.length === 1) {
      const paddedHours = hours.padStart(2, "0")
      setHours(paddedHours)
      updateValue(paddedHours, minutes)
    }
  }

  const handleMinutesBlur = () => {
    if (minutes && minutes.length === 1) {
      const paddedMinutes = minutes.padStart(2, "0")
      setMinutes(paddedMinutes)
      updateValue(hours, paddedMinutes)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Input
          type="text"
          value={hours}
          onChange={handleHoursChange}
          onBlur={handleHoursBlur}
          placeholder="00"
          className="w-12 text-center"
          maxLength={2}
          disabled={disabled}
        />
        <span className="text-muted-foreground font-medium">:</span>
        <Input
          type="text"
          value={minutes}
          onChange={handleMinutesChange}
          onBlur={handleMinutesBlur}
          placeholder="00"
          className="w-12 text-center"
          maxLength={2}
          disabled={disabled}
        />
      </div>
      <span className="text-sm text-muted-foreground">h:m</span>
    </div>
  )
} 