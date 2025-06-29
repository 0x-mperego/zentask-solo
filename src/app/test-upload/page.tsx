import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { FileUploadDirectUploadDemo } from "@/components/file-upload-demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, Download, Trash2 } from "lucide-react";

export default function TestUploadPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Test File Upload"
        description="Test della funzionalità di upload dei file con gestione completa"
      />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              File Upload Component Demo
            </CardTitle>
            <CardDescription>
              Upload, visualizza e gestisci i tuoi file con drag & drop, progress tracking e preview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Upload className="size-4 text-blue-500" />
                  <span>Drag & Drop o Browse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-green-500" />
                  <span>Preview per immagini/PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="size-4 text-purple-500" />
                  <span>Download files</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Massimo 5 file per upload</p>
                <p>• Dimensione massima: 10MB per file</p>
                <p>• Progress bar in tempo reale</p>
                <p>• Gestione errori e notifiche</p>
                <p>• I file vengono salvati temporaneamente in memoria</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <FileUploadDirectUploadDemo />
      </div>
    </PageLayout>
  );
} 