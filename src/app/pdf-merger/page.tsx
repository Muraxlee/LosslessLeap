
import type { Metadata } from 'next';
import PdfMerger from '@/components/pdf-merger';
import { UploadCloud, Combine, Download } from 'lucide-react';
import AdSenseAd from '@/components/adsense-ad';

export const metadata: Metadata = {
    title: 'Merge & Edit PDF Free',
    description: 'Combine multiple PDF files into one. Reorder, arrange, or remove pages easily with our free and secure PDF merger tool.',
    keywords: ['pdf merger', 'combine pdf', 'merge pdf files', 'edit pdf pages', 'pdf combiner'],
};

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload PDFs',
    description: 'Select one or more PDF files you want to work with.',
  },
  {
    icon: Combine,
    title: 'Arrange Pages',
    description: 'Drag and drop to reorder or remove pages from any of the PDFs.',
  },
  {
    icon: Download,
    title: 'Save Merged PDF',
    description: 'Combine all pages into a new, single PDF document.',
  },
];

export default function PdfMergerPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Merge & Edit PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Combine PDFs, reorder pages, or remove them before saving.
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
        
        <PdfMerger />
      </div>
    </div>
  );
}
