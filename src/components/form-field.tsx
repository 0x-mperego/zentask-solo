import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  description?: string;
  required?: boolean;
}

export function FormField({
  label,
  htmlFor,
  children,
  description,
  required,
}: FormFieldProps) {
  return (
    <div className="flex min-w-0 flex-col justify-end gap-3">
      <Label className="break-words" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="min-w-0">{children}</div>
      {description && (
        <p className="break-words text-muted-foreground text-xs">
          {description}
        </p>
      )}
    </div>
  );
}
