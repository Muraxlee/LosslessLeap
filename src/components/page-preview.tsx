
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
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

  useEffect(() => {
    let isMounted = true;
    
    // Set workerSrc only on the client and inside useEffect
    // This ensures it runs after the component has mounted in the browser.
    if (typeof window !== 'undefined') {
      GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    }

    const renderPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Using a unique document loading task for each preview to avoid conflicts
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (!isMounted) {
          // Check if the component is still mounted before proceeding
          if (pdf) {
            // pdf.destroy() is a method on the loaded document proxy to clean up resources
            // It's good practice but check if it exists on the object first.
            (pdf as any).destroy?.();
          }
          return;
        }

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
        if(isMounted) setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [file, pageNumber]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-secondary rounded-md overflow-hidden">
      {isLoading && <Skeleton className="w-full h-full" />}
      {error && <div className="text-destructive text-xs p-1 text-center">{error}</div>}
      <canvas ref={canvasRef} className={cn('transition-opacity duration-300', isLoading || error ? 'opacity-0' : 'opacity-100')} />
    </div>
  );
};

export default PagePreview;
