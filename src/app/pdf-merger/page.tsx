import PdfMerger from '@/components/pdf-merger';

export default function PdfMergerPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Merge & Edit PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Combine PDFs, reorder pages, or remove them before saving.
        </p>
      </div>
      <PdfMerger />
    </div>
  );
}
