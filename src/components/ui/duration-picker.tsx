"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DurationPickerProps {
  value?: string // Format: "HH:MM"
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

export function DurationPicker({
  value = "",
  onChange,
  className,
  disabled = false,
}: DurationPickerProps) {
  const [hours, setHours] = React.useState("")
  const [minutes, setMinutes] = React.useState("")

  React.useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      const hNum = parseInt(h, 10)
      const mNum = parseInt(m, 10)
      setHours(isNaN(hNum) ? "" : String(hNum))
      setMinutes(isNaN(mNum) ? "" : String(mNum))
    } else {
      setHours("")
      setMinutes("")
    }
  }, [value])

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (val.length > 2) val = val.slice(0, 2)
    setHours(val)
    updateValue(val, minutes)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (parseInt(val, 10) > 59) val = "59"
    setMinutes(val)
    updateValue(hours, val)
  }

  const updateValue = (h: string, m: string) => {
    if (h || m) {
      const formattedHours = (h || "0").padStart(2, "0")
      const formattedMinutes = (m || "0").padStart(2, "0")
      onChange?.(`${formattedHours}:${formattedMinutes}`)
    } else {
      onChange?.("")
    }
  }
  
  const commonInputClassName = "w-16 text-center text-lg font-semibold tabular-nums focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"

  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="flex flex-col gap-1 text-center">
        <label htmlFor="hours" className="text-xs">Ore</label>
        <Input
          type="text"
          id="hours"
          value={hours}
          onChange={handleHoursChange}
          placeholder="0"
          className={commonInputClassName}
          maxLength={2}
          disabled={disabled}
        />
       </div>
       <div className="flex flex-col gap-1 text-center">
        <label htmlFor="minutes" className="text-xs">Minuti</label>
        <Input
          type="text"
          id="minutes"
          value={minutes}
          onChange={handleMinutesChange}
          placeholder="0"
          className={commonInputClassName}
          maxLength={2}
          disabled={disabled}
        />
      </div>
    </div>
  )
} 