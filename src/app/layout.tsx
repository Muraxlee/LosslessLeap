
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Menu, Minimize, ArrowRightLeft, FileImage, Combine, Lock, ChevronDown, Image as ImageIcon, File as FileIcon, FileDown, ScanLine } from 'lucide-react';
import AdSenseAd from '@/components/adsense-ad';
import Logo from '@/components/logo';

const siteConfig = {
  name: "LosslessLeap",
  url: "https://losslessleap.netlify.app",
  description: "Compress, convert images, and edit PDFs for free without a server. Fast, private, and easy to use.",
  keywords: ["image compressor", "pdf compressor", "image converter", "pdf merger", "image to pdf", "scan to pdf", "protect pdf", "free tools", "privacy"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Free & Private Image & PDF Tools`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`, // Update with your actual OG image path
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.png`], // Update with your actual OG image path
  },
  icons: {
    icon: "/favicon.ico",
  }
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
      { href: '/scan-to-pdf', label: 'Scan to PDF', icon: ScanLine },
      { href: '/protect-pdf', label: 'Protect PDF', icon: Lock },
    ]
  }
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3673219463234072"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <div className="ad-container-left bg-background">
          <div className="w-40 h-full flex items-center justify-center">
            <AdSenseAd slot="2414212592" />
          </div>
        </div>
        <div className="flex flex-col min-h-screen lg:mx-40">
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
                     <SheetTitle className="sr-only">Menu</SheetTitle>
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
          
          <footer className="py-6 container">
             <div className="ad-container-footer">
               <AdSenseAd slot="2414212592" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your files stay on your device. Always.
            </p>
          </footer>

          <Toaster />
        </div>
        <div className="ad-container-right bg-background">
           <div className="w-40 h-full flex items-center justify-center">
             <AdSenseAd slot="2414212592" />
          </div>
        </div>
      </body>
    </html>
  );
}
