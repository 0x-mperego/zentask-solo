"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  type FileUploadProps,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X, Paperclip, ExternalLink } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

// Interfaccia per gli allegati esistenti
interface Allegato {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FileUploadSheetProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUpload?: FileUploadProps["onUpload"];
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  existingFiles?: Allegato[];
  onRemoveExisting?: (index: number) => void;
}

export function FileUploadSheet({
  files,
  onFilesChange,
  onUpload,
  maxFiles,
  accept,
  maxSize,
  label = "Carica file",
  description = "Trascina i file qui o clicca per sfogliare",
  disabled = false,
  className,
  existingFiles = [],
  onRemoveExisting,
}: FileUploadSheetProps) {
  const [uploadingFiles, setUploadingFiles] = React.useState<Map<File, number>>(new Map());

  // Wrapper per onUpload che traccia il progresso
  const handleUpload: FileUploadProps["onUpload"] = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      // Inizializza tutti i file a 0%
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        files.forEach(file => newMap.set(file, 0));
        return newMap;
      });

      const wrappedOnProgress = (file: File, progress: number) => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.set(file, progress);
          return newMap;
        });
        onProgress(file, progress);
      };

      const wrappedOnSuccess = (file: File) => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file);
          return newMap;
        });
        onSuccess(file);
      };

      const wrappedOnError = (file: File, error: Error) => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file);
          return newMap;
        });
        onError(file, error);
      };

      if (onUpload) {
        await onUpload(files, {
          onProgress: wrappedOnProgress,
          onSuccess: wrappedOnSuccess,
          onError: wrappedOnError,
        });
      } else {
        // Fallback al default upload
        try {
          for (const file of files) {
            try {
              wrappedOnProgress(file, 0);
              
              for (let progress = 5; progress <= 100; progress += 5) {
                await new Promise((resolve) => setTimeout(resolve, 30));
                wrappedOnProgress(file, progress);
              }

              await new Promise((resolve) => setTimeout(resolve, 200));
              wrappedOnSuccess(file);
            } catch (error) {
              wrappedOnError(
                file,
                error instanceof Error ? error : new Error("Upload failed"),
              );
            }
          }
        } catch (error) {
          console.error("Unexpected error during upload:", error);
        }
      }
    },
    [onUpload],
  );

  const defaultOnUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually 
        for (const file of files) {
          try {
            // Start with 0 progress
            onProgress(file, 0);
            
            // Simulate upload with smooth progress (20 steps of 5% in 600ms total)
            for (let progress = 5; progress <= 100; progress += 5) {
              // 30ms per step (600ms / 20 steps)
              await new Promise((resolve) => setTimeout(resolve, 30));
              onProgress(file, progress);
            }

            // Small delay before marking as complete
            await new Promise((resolve) => setTimeout(resolve, 200));
            
            // Mark as successfully uploaded
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        }
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error("File rifiutato", {
      description: `"${file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name}": ${message}`,
    });
  }, []);

  // Usa la stessa formattazione del componente FileUpload
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  const handleFileClick = (url: string) => {
    if (url && typeof url === 'string') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return (
        <img 
          src={url} 
          alt={file.name}
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    return <Paperclip className="size-4 text-muted-foreground" />;
  };

  const handleRemoveFile = (file: File) => {
    const newFiles = files.filter(f => f !== file);
    onFilesChange(newFiles);
    // Rimuovi anche dal tracking del progresso
    setUploadingFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(file);
      return newMap;
    });
  };

  const hasFiles = (existingFiles && existingFiles.length > 0) || files.length > 0;

  return (
    <div className={className}>
      <FileUpload
        value={files}
        onValueChange={onFilesChange}
        onUpload={handleUpload}
        onFileReject={onFileReject}
        maxFiles={maxFiles}
        accept={accept}
        maxSize={maxSize}
        disabled={disabled}
        className="w-full"
        multiple
      >
        <FileUploadDropzone className="cursor-pointer">
          <div className="flex flex-col items-center gap-1 text-center p-2 min-h-[60px] justify-center hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center rounded-full border border-dashed p-1.5">
              <Upload className="size-3 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-xs text-muted-foreground">{label}</p>
              {maxSize && (
                <p className="text-muted-foreground text-xs">
                  Max {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              )}
            </div>
          </div>
        </FileUploadDropzone>
        
        {/* Sezione unica per tutti i file */}
        {hasFiles && (
          <div className="mt-3 space-y-2">
            {/* File esistenti */}
            {existingFiles && existingFiles.filter(allegato => allegato && allegato.name && allegato.url).map((allegato, index) => (
              <div
                key={`existing-${index}`}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => allegato.url && handleFileClick(allegato.url)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded border bg-muted overflow-hidden">
                  {allegato.type && allegato.type.startsWith('image/') ? (
                    <img 
                      src={allegato.url} 
                      alt={allegato.name || 'File'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Paperclip className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-normal text-[13px] leading-snug">{allegato.name || 'File senza nome'}</p>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </div>
                  <p className="truncate text-muted-foreground text-[11px] leading-snug">
                    {formatBytes(allegato.size || 0)}
                  </p>
                </div>
                {onRemoveExisting && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExisting(index);
                    }}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* File in upload - ora con UI custom */}
            {files.map((file, index) => {
              const progress = uploadingFiles.get(file) || 0;
              const isUploading = uploadingFiles.has(file);
              
              return (
                <div
                  key={`uploading-${index}`}
                  className="flex flex-col gap-2 p-2 border rounded-lg"
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded border bg-muted overflow-hidden">
                      {getFilePreview(file)}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-normal text-[13px] leading-snug">{file.name}</p>
                      <p className="truncate text-muted-foreground text-[11px] leading-snug">
                        {formatBytes(file.size)} {isUploading && `• ${progress}%`}
                      </p>
                    </div>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="size-6 shrink-0"
                      disabled={disabled}
                      onClick={() => handleRemoveFile(file)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  
                  {/* Progress bar custom */}
                  {isUploading && (
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                      <div
                        className="h-full bg-primary transition-transform duration-300 ease-linear"
                        style={{
                          transform: `translateX(-${100 - progress}%)`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </FileUpload>
    </div>
  );
} 