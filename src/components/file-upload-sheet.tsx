"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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
}

export function FileUploadSheet({
  files,
  onFilesChange,
  onUpload,
  maxFiles = 5,
  accept,
  maxSize,
  label = "Carica file",
  description = "Trascina i file qui o clicca per sfogliare",
  disabled = false,
  className,
}: FileUploadSheetProps) {
  const defaultOnUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            // Simulate file upload with progress
            const totalChunks = 10;
            let uploadedChunks = 0;

            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Simulate network delay (100-300ms per chunk)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
              );

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 300));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
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

  return (
    <div className={className}>
      <FileUpload
        value={files}
        onValueChange={onFilesChange}
        onUpload={onUpload || defaultOnUpload}
        onFileReject={onFileReject}
        maxFiles={maxFiles}
        accept={accept}
        maxSize={maxSize}
        disabled={disabled}
        className="w-full"
        multiple
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-2 text-center p-4 min-h-[120px] justify-center">
            <div className="flex items-center justify-center rounded-full border border-dashed p-2">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {description}
              </p>
              {maxFiles > 1 && (
                <p className="text-muted-foreground text-xs">
                  (max {maxFiles} file)
                </p>
              )}
            </div>
            <FileUploadTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                disabled={disabled}
              >
                Sfoglia file
              </Button>
            </FileUploadTrigger>
          </div>
        </FileUploadDropzone>
        
        {files.length > 0 && (
          <FileUploadList className="mt-3">
            {files.map((file, index) => (
              <FileUploadItem 
                key={index} 
                value={file} 
                className="flex-col gap-2 p-2 border rounded-lg"
              >
                <div className="flex w-full items-center gap-2">
                  <FileUploadItemPreview className="shrink-0" />
                  <FileUploadItemMetadata size="sm" className="min-w-0 flex-1" />
                  <FileUploadItemDelete asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-6 shrink-0"
                      disabled={disabled}
                    >
                      <X className="size-3" />
                    </Button>
                  </FileUploadItemDelete>
                </div>
                <FileUploadItemProgress className="w-full" />
              </FileUploadItem>
            ))}
          </FileUploadList>
        )}
      </FileUpload>
    </div>
  );
} 