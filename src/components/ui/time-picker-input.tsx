"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/time-picker-utils"
import * as React from "react"

export type TimePickerInputProps = {
  picker: "hours" | "minutes" | "seconds"
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

export const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  const { picker, date, setDate, onLeftFocus, onRightFocus } = props

  const [flag, setFlag] = React.useState<boolean>(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowRight") {
      onRightFocus?.()
    }
    if (e.key === "ArrowLeft") {
      onLeftFocus?.()
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
    setFlag(true)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFlag(false)
  }

  const selectedDate = date ?? new Date(Date.now())

  const getArrowByType = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "increase" | "decrease",
  ) => {
    const newDate = new Date(selectedDate)
    if (picker === "hours") {
      const newHours =
        type === "increase"
          ? (selectedDate.getHours() + 1) % 24
          : (selectedDate.getHours() - 1 + 24) % 24
      newDate.setHours(newHours)
      return newDate
    }
    if (picker === "minutes") {
      const newMinutes =
        type === "increase"
          ? (selectedDate.getMinutes() + 1) % 60
          : (selectedDate.getMinutes() - 1 + 60) % 60
      newDate.setMinutes(newMinutes)
      return newDate
    }
    if (picker === "seconds") {
      const newSeconds =
        type === "increase"
          ? (selectedDate.getSeconds() + 1) % 60
          : (selectedDate.getSeconds() - 1 + 60) % 60
      newDate.setSeconds(newSeconds)
      return newDate
    }
  }

  const handleArrowKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const newDate = getArrowByType(e, "increase")
      setDate(newDate)
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const newDate = getArrowByType(e, "decrease")
      setDate(newDate)
    }
  }

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(selectedDate)
    const value = e.target.value
    if (picker === "hours") {
      newDate.setHours(parseInt(value))
      setDate(newDate)
    }
    if (picker === "minutes") {
      newDate.setMinutes(parseInt(value))
      setDate(newDate)
    }
    if (picker === "seconds") {
      newDate.setSeconds(parseInt(value))
      setDate(newDate)
    }
  }

  const padWithZero = (value: number) => {
    return value.toString().padStart(2, "0")
  }

  return (
    <Input
      ref={ref}
      id={picker}
      name={picker}
      className={cn(
        "w-16 text-center text-lg font-semibold tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]",
        className,
        flag && "text-accent-foreground",
      )}
      value={
        date
          ? padWithZero(
              picker === "hours"
                ? selectedDate.getHours()
                : picker === "minutes"
                  ? selectedDate.getMinutes()
                  : selectedDate.getSeconds(),
            )
          : ""
      }
      onChange={handlePickerChange}
      type="number"
      onKeyDown={(e) => {
        handleKeyDown(e)
        handleArrowKey(e)
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      min={0}
      max={picker === "hours" ? 23 : 59}
      {...props}
    />
  )
})

TimePickerInput.displayName = "TimePickerInput" 