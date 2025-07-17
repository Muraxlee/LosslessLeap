
"use client";

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2, Download, X, FileText, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

interface PageItem {
  originalIndex: number;
  // In the future, we can store a thumbnail preview here
}

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPages([]);
    setIsProcessing(false);
    setIsLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const loadPdf = async (file: File) => {
    setIsLoading(true);
    setPdfFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const pageItems: PageItem[] = Array.from({ length: pageCount }, (_, i) => ({
        originalIndex: i
      }));
      setPages(pageItems);
    } catch (e) {
      console.error("Failed to load PDF", e);
      toast({ variant: "destructive", title: "Could not read PDF", description: "The file might be corrupted or protected." });
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Only PDF files are supported.`,
      });
      return;
    }
    
    handleReset();
    await loadPdf(file);
  }, [handleReset, toast]);

  const removePage = (originalIndex: number) => {
    setPages(prev => prev.filter(p => p.originalIndex !== originalIndex));
  };

  const savePdf = async () => {
    if (!pdfFile || pages.length === 0) {
      toast({ variant: "destructive", title: "No pages to save", description: "Your PDF must have at least one page." });
      return;
    }
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const pageIndicesToKeep = pages.map(p => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, pageIndicesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Saving Error:", error);
      toast({ variant: "destructive", title: "Failed to save PDF", description: "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (!pdfFile) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your PDF here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">Browse File</Button>
          <p className="mt-4 text-xs text-muted-foreground">Upload a single PDF to get started</p>
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
              <CardTitle className="flex items-center gap-2"><Scissors className="text-primary"/> PDF Editor</CardTitle>
              <CardDescription>Remove or rearrange pages, then click "Save PDF".</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4 text-muted-foreground">Loading PDF...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {pages.map((page) => (
                    <div key={page.originalIndex} className="relative group aspect-[3/4]">
                      <div className="flex flex-col items-center justify-center h-full w-full rounded-md border bg-secondary">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-lg font-bold text-foreground">
                          {page.originalIndex + 1}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removePage(page.originalIndex)}
                          aria-label={`Remove page ${page.originalIndex + 1}`}
                        >
                          <X className="h-5 w-5"/>
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  <Button onClick={savePdf} size="lg" disabled={isProcessing || isLoading || pages.length === 0}>
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
