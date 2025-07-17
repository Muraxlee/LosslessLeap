import ImageConverter from '@/components/image-converter';

export default function ImageConverterPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image Converter</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Convert images to PNG, JPG, or WebP format.
        </p>
      </div>
      <ImageConverter />
    </div>
  );
}
