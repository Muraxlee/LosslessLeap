
import ImageCompressor from '@/components/image-compressor';
import { UploadCloud, Sparkles, Download } from 'lucide-react';
import AdSenseAd from '@/components/adsense-ad';

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload Images',
    description: 'Click the browse button or drag and drop your image files.',
  },
  {
    icon: Sparkles,
    title: 'Adjust Quality',
    description: 'Use the slider to set your desired compression level.',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Save your newly compressed images to your device.',
  },
];

export default function ImageCompressorPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image Compressor</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reduce image file sizes without sacrificing quality.
        </p>
      </div>
      
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
             <div key={i} className="flex flex-col items-center text-center">
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                 <step.icon className="h-6 w-6" />
               </div>
               <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
               <p className="text-muted-foreground">{step.description}</p>
             </div>
          ))}
        </div>

        <div className="mb-8 h-24">
          <AdSenseAd slot="2414212592" />
        </div>

        <ImageCompressor />
      </div>
    </div>
  );
}
