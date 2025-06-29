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
import { Upload, X, Download, Eye, FileIcon, Settings } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [isUploading, setIsUploading] = React.useState(false);
  const [autoUpload, setAutoUpload] = React.useState(true);
  
  const uploadFiles = React.useCallback(
    async (filesToUpload: File[], onProgress: (file: File, progress: number) => void, onSuccess: (file: File) => void, onError: (file: File, error: Error) => void) => {
      console.log("🚀 Starting upload process for files:", filesToUpload.map(f => f.name));
      setIsUploading(true);
      
      try {
        // Process each file individually
        const uploadPromises = filesToUpload.map(async (file) => {
          try {
            console.log(`📤 Starting upload for ${file.name}`);
            
            // Simulate file upload with progress - longer delays for visibility
            const totalChunks = 20;
            let uploadedChunks = 0;
 
            // Simulate chunk upload with delays
            for (let i = 0; i < totalChunks; i++) {
              // Longer delay for visible progress
              await new Promise((resolve) =>
                setTimeout(resolve, 200 + Math.random() * 150),
              );
 
              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              console.log(`📊 Progress for ${file.name}: ${progress.toFixed(1)}%`);
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
            await new Promise((resolve) => setTimeout(resolve, 800));
            onSuccess(file);
            
            toast.success(`File uploaded successfully!`, {
              description: `"${file.name}" has been saved`,
            });
            
            console.log(`✅ Upload completed for ${file.name}`);
          } catch (error) {
            console.error(`❌ Upload failed for ${file.name}:`, error);
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
            toast.error(`Upload failed for ${file.name}`);
          }
        });
 
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
        console.log("🎉 All uploads completed!");
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
        toast.error("Unexpected error during upload");
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  // Auto-upload quando vengono aggiunti file (se abilitato)
  const onUpload: NonNullable<FileUploadProps["onUpload"]> | undefined = autoUpload 
    ? React.useCallback(
        async (files, { onProgress, onSuccess, onError }) => {
          await uploadFiles(files, onProgress, onSuccess, onError);
        },
        [uploadFiles],
      )
    : undefined;

  const handleManualUpload = React.useCallback(() => {
    if (files.length === 0) return;
    console.log("🔄 Manual upload triggered for files:", files.map(f => f.name));
    
    // Create mock callbacks for manual upload
    const onProgress = (file: File, progress: number) => {
      console.log(`Manual upload progress for ${file.name}: ${progress}%`);
    };
    const onSuccess = (file: File) => {
      console.log(`Manual upload success for ${file.name}`);
    };
    const onError = (file: File, error: Error) => {
      console.log(`Manual upload error for ${file.name}:`, error);
    };

    uploadFiles(files, onProgress, onSuccess, onError);
  }, [files, uploadFiles]);
 
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
      {/* Upload Settings */}
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Settings className="size-4 text-muted-foreground" />
            <Label htmlFor="auto-upload" className="text-sm font-medium flex-1">
              Auto-upload files when selected
            </Label>
            <Switch
              id="auto-upload"
              checked={autoUpload}
              onCheckedChange={setAutoUpload}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {autoUpload 
              ? "Files will upload automatically when added" 
              : "Files will need to be uploaded manually"
            }
          </p>
        </CardContent>
      </Card>

      {/* Upload Status Indicator */}
      {isUploading && (
        <Card className="w-full max-w-md mx-auto border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm font-medium text-blue-700">
                Uploading files... Please wait
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Upload className={`size-6 ${isUploading ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'}`} />
            </div>
            <p className="font-medium text-sm">
              {isUploading ? 'Uploading...' : 'Drag & drop files here'}
            </p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 5 files, 10MB each)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-fit"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Browse files'}
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="flex-col space-y-2">
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7" disabled={isUploading}>
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress className="h-2" />
            </FileUploadItem>
          ))}
        </FileUploadList>
        
        {/* Manual Upload Trigger */}
        {files.length > 0 && !autoUpload && (
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleManualUpload}
              disabled={isUploading || files.length === 0}
              className="w-full max-w-xs"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
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