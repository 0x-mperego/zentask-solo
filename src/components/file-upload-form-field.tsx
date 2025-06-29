"use client";

import { FormField } from "@/components/form-field";
import { FileUploadSheet } from "@/components/file-upload-sheet";
import { type FileUploadProps } from "@/components/ui/file-upload";

interface FileUploadFormFieldProps {
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUpload?: FileUploadProps["onUpload"];
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  description?: string;
  uploadLabel?: string;
  uploadDescription?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
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
  uploadLabel = "Carica file",
  uploadDescription = "Trascina i file qui o clicca per sfogliare",
  disabled = false,
  required = false,
  className,
}: FileUploadFormFieldProps) {
  return (
    <FormField
      label={label}
      description={description}
      required={required}
    >
      <FileUploadSheet
        files={files}
        onFilesChange={onFilesChange}
        onUpload={onUpload}
        maxFiles={maxFiles}
        accept={accept}
        maxSize={maxSize}
        label={uploadLabel}
        description={uploadDescription}
        disabled={disabled}
        className={className}
      />
    </FormField>
  );
} 