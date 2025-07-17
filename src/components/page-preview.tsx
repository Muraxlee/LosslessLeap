
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { Skeleton } from './ui/skeleton';

interface PagePreviewProps {
  file: File;
  pageNumber: number;
}

// Set workerSrc once when the module loads
// Note: This path might need to be adjusted based on your project's public folder structure
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
}

const PagePreview: React.FC<PagePreviewProps> = ({ file, pageNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
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
        setError('Preview failed');
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();

    // Clean up function to prevent memory leaks with PDF.js
    return () => {
      // You can add cleanup logic here if needed, for instance, destroying the worker
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

// Helper function to use with cn
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');


export default PagePreview;
