import ScanToPdf from '@/components/scan-to-pdf';

export default function ScanToPdfPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Scan to PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Scan documents from your smartphone to your browser.
        </p>
      </div>
      <ScanToPdf />
    </div>
  );
}