
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, Download, X, FileText, Combine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';
import { Separator } from '@/components/ui/separator';

interface PdfQueueItem {
  id: string;
  file: File;
  name: string;
  pages: number;
}

export default function PdfMerger() {
  const [pdfQueue, setPdfQueue] = useState<PdfQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleReset = useCallback(() => {
    setPdfQueue([]);
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const getPageCount = async (file: File): Promise<number> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        return pdfDoc.getPageCount();
    } catch (e) {
        console.error("Failed to read PDF pages", e);
        toast({ variant: "destructive", title: "Could not read PDF", description: file.name });
        return 0;
    }
  }

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: PdfQueueItem[] = [];
    for(const file of Array.from(files)) {
        if (file.type !== 'application/pdf') {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: `Only PDF files are supported. Skipped: ${file.name}`,
          });
          continue;
        }
        
        const pageCount = await getPageCount(file);
        if (pageCount > 0) {
            newItems.push({
                id: `${file.name}-${file.lastModified}-${file.size}`,
                file,
                name: file.name,
                pages: pageCount,
            });
        }
    }
    
    setPdfQueue(prev => [...prev, ...newItems]);
  }, [toast]);
  
  const removeItem = (id: string) => {
    setPdfQueue(prev => prev.filter(item => item.id !== id));
  };

  const mergePdfs = async () => {
    if (pdfQueue.length < 2) {
      toast({ variant: "destructive", title: "Not enough PDFs", description: "Please add two or more PDFs to merge." });
      return;
    }
    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfQueue) {
        const pdfBytes = await item.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
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
      console.error("PDF Merging Error:", error);
      toast({ variant: "destructive", title: "Failed to merge PDFs", description: "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (pdfQueue.length === 0) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your PDFs here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">Browse Files</Button>
          <p className="mt-4 text-xs text-muted-foreground">Only PDF files are supported</p>
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
                    <CardTitle className="flex items-center gap-2"><Combine className="text-primary"/> PDF Queue</CardTitle>
                    <CardDescription>Arrange PDFs in the order you want them merged.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                        {pdfQueue.map(item => (
                            <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                               <FileText className="h-10 w-10 flex-shrink-0 text-muted-foreground" />
                                <div className="flex-grow overflow-hidden">
                                  <p className="truncate font-medium text-foreground">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.pages} page(s)</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} aria-label="Remove PDF">
                                    <X className="h-5 w-5"/>
                                </Button>
                            </div>
                        ))}
                         <Card 
                            onClick={onBrowseClick}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            className={cn("w-full border-2 border-dashed transition-colors flex items-center justify-center cursor-pointer p-4", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
                        >
                             <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" multiple />
                             <div className="text-center text-muted-foreground flex items-center gap-2">
                                <UploadCloud className="h-6 w-6" />
                                <p className="text-sm">Add more PDFs</p>
                             </div>
                        </Card>
                    </div>
                </CardContent>
            </div>
          
            <div>
              <div className="sticky top-20">
                <CardHeader className="p-0 mb-4">
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3">
                        <Button onClick={mergePdfs} size="lg" disabled={isProcessing || pdfQueue.length < 2}>
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-5 w-5"/>
                            )}
                            {isProcessing ? "Merging PDFs..." : "Merge & Download"}
                        </Button>
                        <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                            <X className="mr-2 h-5 w-5" />
                            Clear All
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
