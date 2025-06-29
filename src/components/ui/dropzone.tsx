"use client"

import * as React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileWithPreview extends File {
  preview?: string
}

interface DropzoneProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function Dropzone({
  onFilesChange,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  disabled = false,
  className,
  children,
}: DropzoneProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })
      )

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    },
    [files, maxFiles, onFilesChange]
  )

  const removeFile = (fileToRemove: FileWithPreview) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)

    // Clean up preview URL
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled,
  })

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {children || (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div className="text-center">
              {isDragActive ? (
                isDragReject ? (
                  <p className="text-destructive">File non supportato</p>
                ) : (
                  <p>Rilascia i file qui...</p>
                )
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Clicca per caricare o trascina i file qui
                  </p>
                  <p className="text-xs">
                    Max {maxFiles} file{maxFiles > 1 ? 's' : ''}, {formatFileSize(maxSize)} ciascuno
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">File allegati ({files.length})</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/25"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <File className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 