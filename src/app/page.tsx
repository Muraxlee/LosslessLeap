import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRightLeft, Minimize, FileImage, Combine, Lock } from 'lucide-react';

const tools = [
  {
    title: 'Image Compressor',
    description: 'Reduce the file size of your images without losing quality. Fast and efficient.',
    href: '/image-compressor',
    icon: Minimize,
  },
  {
    title: 'Image Converter',
    description: 'Convert your images to different formats like PNG, JPG, or WebP.',
    href: '/image-converter',
    icon: ArrowRightLeft,
  },
  {
    title: 'Image to PDF',
    description: 'Combine multiple images into a single, easy-to-share PDF document.',
    href: '/image-to-pdf',
    icon: FileImage,
  },
  {
    title: 'Merge & Edit PDF',
    description: 'Combine multiple PDF files, and reorder or remove pages with ease.',
    href: '/pdf-merger',
    icon: Combine,
  },
  {
    title: 'Protect PDF',
    description: 'Add a password to your PDF files to prevent unauthorized access.',
    href: '/protect-pdf',
    icon: Lock,
  },
];

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-12 max-w-3xl text-center mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Free & Private Image and PDF Tools
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Quickly compress images, convert formats, or edit PDF files. Everything happens in your browser, so your files are never uploaded to a server.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.href} className="group">
            <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/50 group-hover:-translate-y-1">
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
