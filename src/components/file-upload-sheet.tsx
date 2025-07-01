'use client';

import { ExternalLink, Paperclip, Upload, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  FileUpload,
  FileUploadDropzone,
  type FileUploadProps,
  FileUploadTrigger,
} from '@/components/ui/file-upload';

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
  onUpload?: FileUploadProps['onUpload'];
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
  label = 'Carica file',
  description = 'Trascina i file qui o clicca per sfogliare',
  disabled = false,
  className,
  existingFiles = [],
  onRemoveExisting,
}: FileUploadSheetProps) {
  const [uploadingFiles, setUploadingFiles] = React.useState<Map<File, number>>(
    new Map()
  );

  // Wrapper per onUpload che traccia il progresso
  const handleUpload: FileUploadProps['onUpload'] = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      }
    ) => {
      // Inizializza tutti i file a 0%
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        files.forEach((file) => newMap.set(file, 0));
        return newMap;
      });

      const wrappedOnProgress = (file: File, progress: number) => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.set(file, progress);
          return newMap;
        });
        onProgress(file, progress);
      };

      const wrappedOnSuccess = (file: File) => {
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(file);
          return newMap;
        });
        onSuccess(file);
      };

      const wrappedOnError = (file: File, error: Error) => {
        setUploadingFiles((prev) => {
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
                error instanceof Error ? error : new Error('Upload failed')
              );
            }
          }
        } catch (error) {
          console.error('Unexpected error during upload:', error);
        }
      }
    },
    [onUpload]
  );

  const defaultOnUpload: NonNullable<FileUploadProps['onUpload']> =
    React.useCallback(
      async (
        files: File[],
        {
          onProgress,
          onSuccess,
          onError,
        }: {
          onProgress: (file: File, progress: number) => void;
          onSuccess: (file: File) => void;
          onError: (file: File, error: Error) => void;
        }
      ) => {
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
                error instanceof Error ? error : new Error('Upload failed')
              );
            }
          }
        } catch (error) {
          console.error('Unexpected error during upload:', error);
        }
      },
      []
    );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error('File rifiutato', {
      description: `"${file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name}": ${message}`,
    });
  }, []);

  // Usa la stessa formattazione del componente FileUpload
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
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
          alt={file.name}
          className="h-full w-full object-cover"
          onLoad={() => URL.revokeObjectURL(url)}
          src={url}
        />
      );
    }
    return <Paperclip className="size-4 text-muted-foreground" />;
  };

  const handleRemoveFile = (file: File) => {
    const newFiles = files.filter((f) => f !== file);
    onFilesChange(newFiles);
    // Rimuovi anche dal tracking del progresso
    setUploadingFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(file);
      return newMap;
    });
  };

  const hasFiles =
    (existingFiles && existingFiles.length > 0) || files.length > 0;

  return (
    <div className={className}>
      <FileUpload
        accept={accept}
        className="w-full"
        disabled={disabled}
        maxFiles={maxFiles}
        maxSize={maxSize}
        multiple
        onFileReject={onFileReject}
        onUpload={handleUpload}
        onValueChange={onFilesChange}
        value={files}
      >
        <FileUploadDropzone className="cursor-pointer rounded-lg transition-colors hover:bg-muted/50">
          <div className="flex min-h-[60px] flex-col items-center justify-center gap-1 p-2 text-center">
            <div className="flex items-center justify-center rounded-full border border-dashed p-1.5">
              <Upload className="size-3 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-xs">
                {label}
              </p>
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
            {existingFiles &&
              existingFiles
                .filter((allegato) => allegato && allegato.name && allegato.url)
                .map((allegato, index) => (
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/50"
                    key={`existing-${index}`}
                    onClick={() =>
                      allegato.url && handleFileClick(allegato.url)
                    }
                  >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted">
                      {allegato.type && allegato.type.startsWith('image/') ? (
                        <img
                          alt={allegato.name || 'File'}
                          className="h-full w-full object-cover"
                          src={allegato.url}
                        />
                      ) : (
                        <Paperclip className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-normal text-[13px] leading-snug">
                          {allegato.name || 'File senza nome'}
                        </p>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground leading-snug">
                        {formatBytes(allegato.size || 0)}
                      </p>
                    </div>
                    {onRemoveExisting && (
                      <Button
                        className="size-6 shrink-0"
                        disabled={disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveExisting(index);
                        }}
                        size="icon"
                        type="button"
                        variant="ghost"
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
                  className="flex flex-col gap-2 rounded-lg border p-2"
                  key={`uploading-${index}`}
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted">
                      {getFilePreview(file)}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-normal text-[13px] leading-snug">
                        {file.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground leading-snug">
                        {formatBytes(file.size)}{' '}
                        {isUploading && `• ${progress}%`}
                      </p>
                    </div>
                    <Button
                      className="size-6 shrink-0"
                      disabled={disabled}
                      onClick={() => handleRemoveFile(file)}
                      size="icon"
                      type="button"
                      variant="ghost"
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
