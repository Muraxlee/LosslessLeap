import type { Metadata } from 'next';
import ProtectPdf from '@/components/protect-pdf';
import { UploadCloud, Lock, Download } from 'lucide-react';
import AdSenseAd from '@/components/adsense-ad';

export const metadata: Metadata = {
    title: 'Protect PDF with Password',
    description: 'Add a strong password to your PDF files to encrypt and secure them from unauthorized access. Free and private.',
    keywords: ['protect pdf', 'encrypt pdf', 'password protect pdf', 'pdf security', 'secure pdf'],
};

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload PDF',
    description: 'Select the PDF file you want to add a password to.',
  },
  {
    icon: Lock,
    title: 'Set Password',
    description: 'Enter and confirm a strong password to encrypt your file.',
  },
  {
    icon: Download,
    title: 'Download Protected File',
    description: 'Save your new, password-protected PDF to your device.',
  },
];


export default function ProtectPdfPage() {
  return (
    <div className="container py-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Protect PDF</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add a password to encrypt and secure your PDF files.
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

        <ProtectPdf />
      </div>
    </div>
  );
}
