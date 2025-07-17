
import type { Metadata } from 'next';
import ImageConverter from '@/components/image-converter';
import { UploadCloud, ArrowRightLeft, Download } from 'lucide-react';
import AdSenseAd from '@/components/adsense-ad';

export const metadata: Metadata = {
    title: 'Online Image Converter',
    description: 'Convert images to PNG, JPG, or WebP format for free. Fast, easy, and secure processing directly in your browser.',
    keywords: ['image converter', 'convert to png', 'convert to jpg', 'convert to webp', 'image format'],
};

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload Images',
    description: 'Click the browse button or drag and drop your image files.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Choose Format',
    description: 'Select the output format you want to convert to (PNG, JPG, WebP).',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Save your newly converted images to your device.',
  },
];


export default function ImageConverterPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image Converter</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Convert images to PNG, JPG, or WebP format.
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
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

        <ImageConverter />
      </div>
    </div>
  );
}
