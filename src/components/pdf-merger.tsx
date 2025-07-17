
"use client";

import { useState, useCallback, useRef, DragEvent as ReactDragEvent } from 'react';
import { UploadCloud, Loader2, Download, X, FileText, Combine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

interface PageItem {
  id: string;
  pdfId: string;
  pdfName: string;
  originalPageIndex: number;
}

interface PdfFileItem {
    id: string;
    file: File;
}

export default function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<Map<string, PdfFileItem>>(new Map());
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const { toast } = useToast();

  const handleReset = useCallback(() => {
    setPdfFiles(new Map());
    setPages([]);
    setIsProcessing(false);
    setIsLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const loadPdfPages = async (file: File): Promise<PageItem[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const id = `${file.name}-${file.lastModified}-${file.size}`;
      
      const newPdfFileItem = { id, file };
      setPdfFiles(prev => new Map(prev).set(id, newPdfFileItem));

      return Array.from({ length: pageCount }, (_, i) => ({
        id: `${id}-p${i}`,
        pdfId: id,
        pdfName: file.name,
        originalPageIndex: i
      }));
    } catch (e) {
      console.error("Failed to read PDF pages", e);
      toast({ variant: "destructive", title: "Could not read PDF", description: file.name });
      return [];
    }
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);

    const newPages: PageItem[] = [];
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `Only PDF files are supported. Skipped: ${file.name}`,
        });
        continue;
      }
      const loadedPages = await loadPdfPages(file);
      newPages.push(...loadedPages);
    }
    
    setPages(prev => [...prev, ...newPages]);
    setIsLoading(false);
  }, [toast]);
  
  const removePage = (id: string) => {
    setPages(prev => {
        const newPages = prev.filter(p => p.id !== id);
        // Clean up pdfFile from map if no pages are left from it
        const removedPage = prev.find(p => p.id === id);
        if (removedPage) {
            const isPdfStillInUse = newPages.some(p => p.pdfId === removedPage.pdfId);
            if (!isPdfStillInUse) {
                setPdfFiles(prevFiles => {
                    const newFiles = new Map(prevFiles);
                    newFiles.delete(removedPage.pdfId);
                    return newFiles;
                });
            }
        }
        return newPages;
    });
  };

  const mergeAndSavePdfs = async () => {
    if (pages.length === 0) {
      toast({ variant: "destructive", title: "No pages to save", description: "Please add one or more PDFs." });
      return;
    }
    setIsProcessing(true);
    
    try {
      const newPdf = await PDFDocument.create();
      
      // Keep track of loaded source pdfs to avoid reloading
      const loadedPdfs = new Map<string, PDFDocument>();

      for (const page of pages) {
        let sourcePdf = loadedPdfs.get(page.pdfId);
        if (!sourcePdf) {
            const pdfFileItem = pdfFiles.get(page.pdfId);
            if(pdfFileItem) {
              const arrayBuffer = await pdfFileItem.file.arrayBuffer();
              sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
              loadedPdfs.set(page.pdfId, sourcePdf);
            }
        }

        if(sourcePdf) {
            const [copiedPage] = await newPdf.copyPages(sourcePdf, [page.originalPageIndex]);
            newPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged-document.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Merging/Saving Error:", error);
      toast({ variant: "destructive", title: "Failed to save PDF", description: "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragStart = (e: ReactDragEvent, index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (e: ReactDragEvent, index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = (e: ReactDragEvent) => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null) {
      const newPages = [...pages];
      const dragItem = newPages.splice(dragItemRef.current, 1)[0];
      newPages.splice(dragOverItemRef.current, 0, dragItem);
      setPages(newPages);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };
  
  const handleDragOver = (e: ReactDragEvent) => e.preventDefault(); // Necessary for onDrop to fire

  const handleGlobalDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (pages.length === 0) {
    return (
      <Card
        onDragEnter={handleGlobalDrag} onDragLeave={handleGlobalDrag} onDragOver={handleGlobalDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your PDFs here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">Browse Files</Button>
          <p className="mt-4 text-xs text-muted-foreground">Add multiple PDFs to merge and edit</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 p-6">
          <div className="lg:col-span-2">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center gap-2"><Combine className="text-primary"/> PDF Pages</CardTitle>
              <CardDescription>Drag to reorder pages, then click "Save PDF".</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4 text-muted-foreground">Loading PDFs...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" onDragOver={handleDragOver}>
                  {pages.map((page, index) => (
                    <div 
                      key={page.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDragEnd}
                      className="relative group aspect-[3/4] cursor-grab"
                    >
                      <div className="flex flex-col items-center justify-center h-full w-full rounded-md border bg-secondary p-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {page.originalPageIndex + 1}
                        </p>
                        <p className="text-xs text-muted-foreground truncate w-full text-center px-1" title={page.pdfName}>{page.pdfName}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removePage(page.id)}
                          aria-label={`Remove page ${page.originalPageIndex + 1}`}
                        >
                          <X className="h-5 w-5"/>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Card 
                    onClick={onBrowseClick}
                    onDragEnter={handleGlobalDrag} onDragLeave={handleGlobalDrag} onDragOver={handleGlobalDrag} onDrop={handleDrop}
                    className={cn("w-full aspect-[3/4] border-2 border-dashed transition-colors flex items-center justify-center cursor-pointer", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
                  >
                      <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" multiple />
                      <div className="text-center text-muted-foreground">
                        <UploadCloud className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Add more</p>
                      </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </div>
          
          <div>
            <div className="sticky top-20">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col gap-3">
                  <Button onClick={mergeAndSavePdfs} size="lg" disabled={isProcessing || isLoading || pages.length === 0}>
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-5 w-5"/>
                    )}
                    {isProcessing ? "Saving PDF..." : "Save & Download"}
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                    <X className="mr-2 h-5 w-5" />
                    Clear & Start Over
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
