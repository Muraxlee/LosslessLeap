import ImageTools from '@/components/image-tools';
import { Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
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
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center sm:p-6 md:p-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Free & Private Image and PDF Tools
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quickly compress images, convert formats, or edit PDF files. Everything happens in your browser, so your files are never uploaded to a server.
          </p>
        </div>
        <ImageTools />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Your files stay on your device. Always.
      </footer>
    </div>
  );
}
