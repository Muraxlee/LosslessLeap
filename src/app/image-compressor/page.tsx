import ImageCompressor from '@/components/image-compressor';

export default function ImageCompressorPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image Compressor</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reduce image file sizes without sacrificing quality.
        </p>
      </div>
      <ImageCompressor />
    </div>
  );
}
