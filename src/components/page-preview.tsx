
"use client";

import React, { useRef, useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { getDocument as getDocumentType, GlobalWorkerOptions as GlobalWorkerOptionsType } from 'pdfjs-dist/types/src/display/api';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface PagePreviewProps {
  file: File;
  pageNumber: number;
}

const PagePreview: React.FC<PagePreviewProps> = ({ file, pageNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pdfJs, setPdfJs] = useState<{
      getDocument: typeof getDocumentType;
      GlobalWorkerOptions: typeof GlobalWorkerOptionsType;
  } | null>(null);

  // Dynamically import the library on mount (client-side only)
  useEffect(() => {
    const importPdfJs = async () => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
        // This is a common pattern for Next.js to ensure the worker is loaded correctly.
        GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
        setPdfJs({ getDocument, GlobalWorkerOptions });
      } catch (e) {
        console.error("Failed to load pdfjs-dist", e);
        setError("Failed to load viewer.");
        setIsLoading(false);
      }
    };
    importPdfJs();
  }, []);


  useEffect(() => {
    // Only proceed if the library is loaded and a file is present
    if (!pdfJs || !file) return;

    let isMounted = true;
    let pdf: PDFDocumentProxy | null = null;
    
    const renderPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!isMounted) return;
        
        const loadingTask = pdfJs.getDocument({ data: arrayBuffer, cMapUrl: `https://unpkg.com/pdfjs-dist@4.4.172/cmaps/`, cMapPacked: true });
        pdf = await loadingTask.promise;

        if (!isMounted) return;

        const page = await pdf.getPage(pageNumber);
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale for thumbnail
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');
        if (!context) return;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;

      } catch (err) {
        console.error(`Failed to render page ${pageNumber} of ${file.name}`, err);
        if(isMounted) setError('Preview failed');
      } finally {
        if (pdf) {
            pdf.destroy();
        }
        if(isMounted) setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [file, pageNumber, pdfJs]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-secondary rounded-md overflow-hidden">
      {isLoading && <Skeleton className="w-full h-full" />}
      {error && <div className="text-destructive text-xs p-1 text-center">{error}</div>}
      <canvas ref={canvasRef} className={cn('transition-opacity duration-300', isLoading || error ? 'opacity-0' : 'opacity-100')} />
    </div>
  );
};

export default PagePreview;
