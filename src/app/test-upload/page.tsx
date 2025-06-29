import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { FileUploadDirectUploadDemo } from "@/components/file-upload-demo";

export default function TestUploadPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Test File Upload"
        description="Test della funzionalità di upload dei file"
      />
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">File Upload Component Demo</h2>
          <p className="text-sm text-muted-foreground">
            Questo è un esempio del component per l'upload dei file con drag & drop,
            progress bar e gestione degli errori.
          </p>
        </div>
        <div className="flex justify-center">
          <FileUploadDirectUploadDemo />
        </div>
      </div>
    </PageLayout>
  );
} 