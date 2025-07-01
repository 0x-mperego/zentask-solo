'use client';

import { FileUploadSheet } from '@/components/file-upload-sheet';
import { FormField } from '@/components/form-field';
import type { FileUploadProps } from '@/components/ui/file-upload';

// Interfaccia per gli allegati esistenti
interface Allegato {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FileUploadFormFieldProps {
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUpload?: FileUploadProps['onUpload'];
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  description?: string;
  uploadLabel?: string;
  uploadDescription?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  existingFiles?: Allegato[];
  onRemoveExisting?: (index: number) => void;
}

export function FileUploadFormField({
  label,
  files,
  onFilesChange,
  onUpload,
  maxFiles = 5,
  accept,
  maxSize,
  description,
  uploadLabel = 'Carica file',
  uploadDescription = 'Trascina i file qui o clicca per sfogliare',
  disabled = false,
  required = false,
  className,
  existingFiles = [],
  onRemoveExisting,
}: FileUploadFormFieldProps) {
  return (
    <FormField description={description} label={label} required={required}>
      <FileUploadSheet
        accept={accept}
        className={className}
        description={uploadDescription}
        disabled={disabled}
        existingFiles={existingFiles}
        files={files}
        label={uploadLabel}
        maxFiles={maxFiles}
        maxSize={maxSize}
        onFilesChange={onFilesChange}
        onRemoveExisting={onRemoveExisting}
        onUpload={onUpload}
      />
    </FormField>
  );
}
