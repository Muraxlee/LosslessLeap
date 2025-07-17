import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Minimize, ArrowRightLeft, FileImage, Combine } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LosslessLeap - Free & Private Image & PDF Tools',
  description: 'Compress, convert images, and edit PDFs for free without a server. Fast, private, and easy to use.',
};

const navLinks = [
  { href: '/image-compressor', label: 'Compress Image', icon: Minimize },
  { href: '/image-converter', label: 'Convert Image', icon: ArrowRightLeft },
  { href: '/image-to-pdf', label: 'Image to PDF', icon: FileImage },
  { href: '/pdf-merger', label: 'Merge & Edit PDF', icon: Combine },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <Link href="/" className="mr-6 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-primary"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
                <path d="m17 10-2.5-2.5" />
                <path d="m7 10 2.5-2.5" />
              </svg>
              <h1 className="text-xl font-semibold text-foreground">LosslessLeap</h1>
            </Link>
            
            <nav className="hidden items-center gap-4 text-sm md:flex">
              {navLinks.map(({ href, label }) => (
                <Button key={href} variant="ghost" asChild>
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </nav>

            <div className="flex flex-1 items-center justify-end md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                   <Link href="/" className="mr-6 flex items-center gap-3 mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7 text-primary"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                        <path d="m17 10-2.5-2.5" />
                        <path d="m7 10 2.5-2.5" />
                      </svg>
                      <h1 className="text-xl font-semibold text-foreground">LosslessLeap</h1>
                    </Link>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                      <Button key={href} variant="ghost" asChild className="justify-start">
                        <Link href={href}><Icon className="mr-2 h-4 w-4"/>{label}</Link>
                      </Button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="py-6 text-center text-sm text-muted-foreground container">
          Your files stay on your device. Always.
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
