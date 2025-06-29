"use client";

import { FileUploadDirectUploadDemo } from "@/components/file-upload-demo";

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Test Upload File</h1>
          <p className="text-muted-foreground mt-2">
            Prova il componente di upload file con drag & drop
          </p>
        </div>
        
        <div className="flex justify-center">
          <FileUploadDirectUploadDemo />
        </div>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Caratteristiche:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Drag & drop supportato</li>
            <li>Massimo 2 files per volta</li>
            <li>Barra di progresso simulata</li>
            <li>Anteprima dei file</li>
            <li>Cancellazione individuale dei file</li>
            <li>Toast notifications per i file rifiutati</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 