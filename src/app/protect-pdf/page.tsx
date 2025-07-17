import ProtectPdf from '@/components/protect-pdf';

export default function ProtectPdfPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Protect PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add a password to encrypt and secure your PDF files.
        </p>
      </div>
      <ProtectPdf />
    </div>
  );
}
