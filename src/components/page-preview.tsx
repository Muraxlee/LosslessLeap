
"use client";

import React, { useRef, useEffect, useState } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, GlobalWorkerOptions as GlobalWorkerOptionsType } from 'pdfjs-dist';
import type { getDocument as getDocumentType } from 'pdfjs-dist/types/src/display/api';
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

  // State to hold the dynamically imported pdfjs-dist functions
  const [pdfjs, setPdfjs] = useState<{
    getDocument: typeof getDocumentType;
    GlobalWorkerOptions: typeof GlobalWorkerOptionsType;
  } | null>(null);

  // Dynamically import the library on mount (client-side only)
  useEffect(() => {
    const importPdfjs = async () => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
        setPdfjs({ getDocument, GlobalWorkerOptions });
      } catch (e) {
        console.error("Failed to load pdfjs-dist", e);
        setError("Failed to load viewer.");
        setIsLoading(false);
      }
    };
    importPdfjs();
  }, []);

  useEffect(() => {
    // Only proceed if the library is loaded and a file is present
    if (!pdfjs || !file) return;

    let isMounted = true;
    const renderPage = async () => {
      setIsLoading(true);
      setError(null);
      let pdf: PDFDocumentProxy | null = null;
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Ensure component is still mounted before proceeding
        if (!isMounted) return;
        
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;

        if (!isMounted) return;

        const page = await pdf.getPage(pageNumber);
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale for thumbnail quality
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
            // pdf.destroy() is a method on the loaded document proxy to clean up resources
            (pdf as any).destroy?.();
        }
        if(isMounted) setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [file, pageNumber, pdfjs]); // Rerun when pdfjs is loaded

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-secondary rounded-md overflow-hidden">
      {isLoading && <Skeleton className="w-full h-full" />}
      {error && <div className="text-destructive text-xs p-1 text-center">{error}</div>}
      <canvas ref={canvasRef} className={cn('transition-opacity duration-300', isLoading || error ? 'opacity-0' : 'opacity-100')} />
    </div>
  );
};

export default PagePreview;
