"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Upload, X, Download, Eye, FileIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface SavedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}
 
export function FileUploadDirectUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [savedFiles, setSavedFiles] = React.useState<SavedFile[]>([]);
 
  const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
          try {
            console.log(`Starting upload for ${file.name}`);
            
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
              console.log(`Progress for ${file.name}: ${progress}%`);
              onProgress(file, progress);
            }

            // Create blob URL for the file (simulating file save)
            const fileUrl = URL.createObjectURL(file);
            
            // Save file info to state
            const savedFile: SavedFile = {
              name: file.name,
              size: file.size,
              type: file.type,
              url: fileUrl,
              uploadedAt: new Date(),
            };

            setSavedFiles(prev => [...prev, savedFile]);
 
            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
            
            toast.success(`File uploaded successfully!`, {
              description: `"${file.name}" has been saved`,
            });
            
            console.log(`Upload completed for ${file.name}`);
          } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error);
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
            toast.error(`Upload failed for ${file.name}`);
          }
        });
 
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
        toast.error("Unexpected error during upload");
      }
    },
    [],
  );
 
  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (savedFile: SavedFile) => {
    const link = document.createElement('a');
    link.href = savedFile.url;
    link.download = savedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (savedFile: SavedFile) => {
    if (savedFile.type.startsWith('image/') || savedFile.type === 'application/pdf') {
      window.open(savedFile.url, '_blank');
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  const handleDeleteSaved = (index: number) => {
    setSavedFiles(prev => {
      const newFiles = [...prev];
      // Revoke the blob URL to free memory
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
 
  return (
    <div className="w-full space-y-6">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onUpload={onUpload}
        onFileReject={onFileReject}
        maxFiles={5}
        maxSize={10 * 1024 * 1024} // 10MB
        className="w-full max-w-md mx-auto"
        multiple
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">Drag & drop files here</p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 5 files, 10MB each)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="flex-col">
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {savedFiles.length > 0 && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="size-5" />
              Saved Files ({savedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedFiles.map((savedFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {savedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(savedFile.size)} • {savedFile.type} • 
                      Uploaded {savedFile.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePreview(savedFile)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(savedFile)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSaved(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 