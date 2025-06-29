"use client";

import { FileUploadDirectUploadDemo } from "@/components/file-upload-demo";
import { FileUploadSheet } from "@/components/file-upload-sheet";
import { FileUploadFormField } from "@/components/file-upload-form-field";
import { StandardFormSheet } from "@/components/standard-form-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function TestUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Form submitted:", { formData, files });
    // Simula il salvataggio
    setSheetOpen(false);
    setFiles([]);
    setFormData({ title: "", description: "" });
  };

  const handleCancel = () => {
    setSheetOpen(false);
    setFiles([]);
    setFormData({ title: "", description: "" });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Test Upload File</h1>
          <p className="text-muted-foreground mt-2">
            Prova il componente di upload file con drag & drop
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Versione completa */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Versione Full Page</h2>
            <div className="flex justify-center">
              <FileUploadDirectUploadDemo />
            </div>
          </div>

          {/* Versione per sheet */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Versione per Sheet</h2>
            <div className="space-y-4">
              <Button onClick={() => setSheetOpen(true)}>
                Apri Sheet con Upload
              </Button>
              
              <StandardFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                title="Nuovo Documento"
                description="Crea un nuovo documento con allegati"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitText="Salva Documento"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titolo</Label>
                    <Input
                      id="title"
                      placeholder="Inserisci il titolo del documento"
                      value={formData.title}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <Textarea
                      id="description"
                      placeholder="Inserisci una descrizione"
                      value={formData.description}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  
                  <FileUploadFormField
                    label="Allegati"
                    description="Carica i documenti relativi a questo elemento"
                    files={files}
                    onFilesChange={setFiles}
                    maxFiles={3}
                    uploadLabel="Carica documenti"
                    uploadDescription="PDF, DOC, IMG fino a 10MB"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    maxSize={10 * 1024 * 1024} // 10MB
                    required
                  />
                </div>
              </StandardFormSheet>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Caratteristiche:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Versione Full Page:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Drag & drop supportato</li>
                <li>Massimo 2 files per volta</li>
                <li>Barra di progresso simulata</li>
                <li>Anteprima dei file</li>
                <li>Cancellazione individuale dei file</li>
                <li>Toast notifications per i file rifiutati</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Versione Sheet:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Design compatto per sheet</li>
                <li>Integrato nei form</li>
                <li>Validazione file type e size</li>
                <li>Configurabile (max files, accept, etc.)</li>
                <li>Progress bar ottimizzata</li>
                <li>Toast notifications personalizzate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 