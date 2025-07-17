import ImageToPdf from '@/components/image-to-pdf';

export default function ImageToPdfPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image to PDF Converter</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Combine multiple JPG or PNG images into a single PDF file.
        </p>
      </div>
      <ImageToPdf />
    </div>
  );
}
