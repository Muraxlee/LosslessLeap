import type { Metadata } from 'next';
import PdfCompressor from '@/components/pdf-compressor';
import { UploadCloud, Sparkles, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AdSenseAd from '@/components/adsense-ad';

export const metadata: Metadata = {
    title: 'Compress PDF Free',
    description: 'Reduce the file size of your PDFs quickly and for free while maintaining the best possible quality. No file uploads required.',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf optimizer', 'free pdf compressor'],
};

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload PDF',
    description: 'Click the browse button or drag and drop your PDF file.',
  },
  {
    icon: Sparkles,
    title: 'Adjust & Compress',
    description: 'Use the slider to set the image quality and click compress.',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Your compressed, smaller PDF is ready to be downloaded.',
  },
];


export default function CompressPdfPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Compress PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reduce the file size of your PDFs while maintaining quality.
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

        <PdfCompressor />
      </div>

    </div>
  );
}
