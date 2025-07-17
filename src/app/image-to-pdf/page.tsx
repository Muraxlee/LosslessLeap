
import ImageToPdf from '@/components/image-to-pdf';
import { UploadCloud, FileImage, Download } from 'lucide-react';

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload Images',
    description: 'Select one or more JPG or PNG images from your device.',
  },
  {
    icon: FileImage,
    title: 'Arrange & Configure',
    description: 'Drag to reorder your images and set the page size and margins.',
  },
  {
    icon: Download,
    title: 'Create & Download',
    description: 'Combine your images into a single PDF file to download.',
  },
];

export default function ImageToPdfPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Image to PDF Converter</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Combine multiple JPG or PNG images into a single PDF file.
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
        <ImageToPdf />
      </div>
    </div>
  );
}
