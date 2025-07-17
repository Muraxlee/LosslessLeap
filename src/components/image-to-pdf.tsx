
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Loader2, Download, X, FileImage, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, PageSizes, StandardFonts } from 'pdf-lib';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface ImageQueueItem {
  id: string;
  file: File;
  preview: string;
}

const PAGE_SIZES = {
  A4: PageSizes.A4,
  A3: PageSizes.A3,
  A5: PageSizes.A5,
  Letter: PageSizes.Letter,
  Legal: PageSizes.Legal,
};

type PageSize = keyof typeof PAGE_SIZES;

export default function ImageToPdf() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [margin, setMargin] = useState(20);

  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef(imageQueue);
  queueRef.current = imageQueue;

  const { toast } = useToast();

  const handleReset = useCallback(() => {
    queueRef.current.forEach(item => URL.revokeObjectURL(item.preview));
    setImageQueue([]);
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  useEffect(() => {
    return () => {
      queueRef.current.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: ImageQueueItem[] = Array.from(files)
      .filter(file => {
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: `Only JPG and PNG images are supported. Skipped: ${file.name}`,
          });
          return false;
        }
        return true;
      })
      .map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        preview: URL.createObjectURL(file),
      }));
    
    setImageQueue(prev => [...prev, ...newItems]);
  }, [toast]);
  
  const removeItem = (id: string) => {
    setImageQueue(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove) URL.revokeObjectURL(itemToRemove.preview);
      return prev.filter(item => item.id !== id);
    });
  };

  const createPdf = async () => {
    if (imageQueue.length === 0) {
      toast({ variant: "destructive", title: "No images added", description: "Please add one or more images." });
      return;
    }
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      const selectedPageSize = PAGE_SIZES[pageSize];

      for (const item of imageQueue) {
        const imageBytes = await item.file.arrayBuffer();
        let image;
        if (item.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const page = pdfDoc.addPage(selectedPageSize);
        const { width: pageW, height: pageH } = page.getSize();
        
        const availableWidth = pageW - margin * 2;
        const availableHeight = pageH - margin * 2;
        
        const imageAspectRatio = image.width / image.height;
        const availableAspectRatio = availableWidth / availableHeight;

        let finalWidth, finalHeight;
        if (imageAspectRatio > availableAspectRatio) {
            finalWidth = availableWidth;
            finalHeight = finalWidth / imageAspectRatio;
        } else {
            finalHeight = availableHeight;
            finalWidth = finalHeight * imageAspectRatio;
        }

        const xPos = (pageW - finalWidth) / 2;
        const yPos = (pageH - finalHeight) / 2;

        page.drawImage(image, { x: xPos, y: yPos, width: finalWidth, height: finalHeight });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-images.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF Creation Error:", error);
      toast({ variant: "destructive", title: "Failed to create PDF", description: "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (imageQueue.length === 0) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/png, image/jpeg" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">Browse Files</Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PNG and JPG</p>
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
                    <CardTitle className="flex items-center gap-2"><FileImage className="text-primary"/> Image Queue</CardTitle>
                    <CardDescription>Arrange images and click "Create PDF".</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageQueue.map(item => (
                            <div key={item.id} className="relative group aspect-square">
                                <NextImage src={item.preview} alt={item.file.name} fill className="object-cover rounded-md" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                    <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)} aria-label="Remove image">
                                        <X className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Card 
                            onClick={onBrowseClick}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            className={cn("w-full aspect-square border-2 border-dashed transition-colors flex items-center justify-center cursor-pointer", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
                        >
                             <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/png, image/jpeg" multiple />
                             <div className="text-center text-muted-foreground">
                                <UploadCloud className="mx-auto h-10 w-10" />
                                <p className="mt-2 text-sm">Add more</p>
                             </div>
                        </Card>
                    </div>
                </CardContent>
            </div>
          
            <div>
              <div className="sticky top-20">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="page-size" className="text-base">Page Size</Label>
                            <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                              <SelectTrigger id="page-size" className="w-full">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(PAGE_SIZES).map(size => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                                <Label htmlFor="margin" className="text-base">Page Margin (px)</Label>
                                <span className="w-16 rounded-md border px-2 py-1 text-center font-mono text-sm">{margin}</span>
                            </div>
                            <Slider id="margin" value={[margin]} min={0} max={100} step={5} onValueChange={([val]) => setMargin(val)} />
                        </div>
                    </div>
                    
                    <Separator className="my-6" />

                    <div className="flex flex-col gap-3">
                        <Button onClick={createPdf} size="lg" disabled={isProcessing}>
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-5 w-5"/>
                            )}
                            {isProcessing ? "Creating PDF..." : "Create & Download PDF"}
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
