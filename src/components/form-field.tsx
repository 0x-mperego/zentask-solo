import { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  htmlFor?: string
  children: ReactNode
  description?: string
  required?: boolean
}

export function FormField({ 
  label, 
  htmlFor, 
  children, 
  description, 
  required 
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <Label htmlFor={htmlFor} className="break-words">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="min-w-0">
        {children}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground break-words">{description}</p>
      )}
    </div>
  )
} 