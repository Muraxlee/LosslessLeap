import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Menu, Minimize, ArrowRightLeft, FileImage, Combine, Lock, ChevronDown, Image as ImageIcon, File as FileIcon, FileDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LosslessLeap - Free & Private Image & PDF Tools',
  description: 'Compress, convert images, and edit PDFs for free without a server. Fast, private, and easy to use.',
};

const navGroups = [
  {
    title: 'Image Tools',
    icon: ImageIcon,
    links: [
      { href: '/image-compressor', label: 'Compress Image', icon: Minimize },
      { href: '/image-converter', label: 'Convert Image', icon: ArrowRightLeft },
      { href: '/image-to-pdf', label: 'Image to PDF', icon: FileImage },
    ]
  },
  {
    title: 'PDF Tools',
    icon: FileIcon,
    links: [
      { href: '/compress-pdf', label: 'Compress PDF', icon: FileDown },
      { href: '/pdf-merger', label: 'Merge & Edit PDF', icon: Combine },
      { href: '/protect-pdf', label: 'Protect PDF', icon: Lock },
    ]
  }
];

const Logo = () => (
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
)

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
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <Link href="/" className="mr-6 flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-semibold text-foreground">LosslessLeap</h1>
            </Link>
            
            <nav className="hidden items-center gap-2 text-sm md:flex">
              {navGroups.map((group) => (
                <DropdownMenu key={group.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      {group.title} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {group.links.map(({ href, label, icon: Icon }) => (
                      <DropdownMenuItem key={href} asChild>
                        <Link href={href}>
                          <Icon className="mr-2 h-4 w-4" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <Logo />
                      <h1 className="text-xl font-semibold text-foreground">LosslessLeap</h1>
                    </Link>
                  <nav className="flex flex-col gap-2">
                    <Accordion type="multiple" className="w-full">
                      {navGroups.map((group) => (
                        <AccordionItem value={group.title} key={group.title}>
                           <AccordionTrigger className="text-base font-medium py-3 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <group.icon className="h-5 w-5 text-primary" />
                                {group.title}
                              </div>
                            </AccordionTrigger>
                           <AccordionContent className="pl-4">
                              <div className="flex flex-col gap-1 mt-2">
                                {group.links.map(({ href, label, icon: Icon }) => (
                                  <Button key={href} variant="ghost" asChild className="justify-start">
                                    <Link href={href}><Icon className="mr-2 h-4 w-4"/>{label}</Link>
                                  </Button>
                                ))}
                              </div>
                           </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
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
