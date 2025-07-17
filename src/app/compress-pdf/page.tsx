import PdfCompressor from '@/components/pdf-compressor';

export default function CompressPdfPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Compress PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reduce the file size of your PDFs while maintaining quality.
        </p>
      </div>
      <PdfCompressor />
    </div>
  );
}
