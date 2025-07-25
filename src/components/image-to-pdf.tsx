
"use client";

import { useState, useCallback, useRef, useEffect, DragEvent as ReactDragEvent } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Loader2, Download, X, FileImage, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, PageSizes } from 'pdf-lib';
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

type PageSizeOption = keyof typeof PAGE_SIZES | 'Fit';

export default function ImageToPdf() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [pageSize, setPageSize] = useState<PageSizeOption>('A4');
  const [margin, setMargin] = useState(20);

  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef(imageQueue);
  queueRef.current = imageQueue;
  
  const dragItemRef = useRef<number | null>(null);

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

      for (const item of imageQueue) {
        const imageBytes = await item.file.arrayBuffer();
        let image;
        if (item.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        let page;
        if (pageSize === 'Fit') {
          const pageW = image.width + margin * 2;
          const pageH = image.height + margin * 2;
          page = pdfDoc.addPage([pageW, pageH]);
          page.drawImage(image, { x: margin, y: margin, width: image.width, height: image.height });

        } else {
          const selectedPageSize = PAGE_SIZES[pageSize];
          page = pdfDoc.addPage(selectedPageSize);
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

  const handleGlobalDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleGlobalDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };
  
  const handleDragStart = (e: ReactDragEvent, index: number) => {
    dragItemRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: ReactDragEvent, index: number) => {
    e.preventDefault();
    const draggedOverItem = e.currentTarget as HTMLDivElement;
    draggedOverItem.style.border = "2px dashed #64B5CD"; // Or use a class
  };

  const handleDragLeave = (e: ReactDragEvent) => {
    const draggedOverItem = e.currentTarget as HTMLDivElement;
    draggedOverItem.style.border = ""; // Reset style
  };

  const handleDrop = (e: ReactDragEvent, index: number) => {
    e.preventDefault();
    const draggedOverItem = e.currentTarget as HTMLDivElement;
    draggedOverItem.style.border = ""; // Reset style

    if (dragItemRef.current === null) return;
    
    if (dragItemRef.current !== index) {
        const newQueue = [...imageQueue];
        const dragItemContent = newQueue.splice(dragItemRef.current, 1)[0];
        newQueue.splice(index, 0, dragItemContent);
        setImageQueue(newQueue);
    }
    dragItemRef.current = null;
  };

  if (imageQueue.length === 0) {
    return (
      <Card
        onDragEnter={handleGlobalDrag} onDragLeave={handleGlobalDrag} onDragOver={handleGlobalDrag} onDrop={handleGlobalDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/png, image/jpeg" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} className="mt-4">Browse Files</Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PNG and JPG</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileImage className="text-primary"/> Image Queue</CardTitle>
                    <CardDescription>Drag to reorder images, then click "Create PDF".</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imageQueue.map((item, index) => (
                            <div 
                                key={item.id} 
                                className="relative group aspect-square cursor-grab rounded-lg overflow-hidden border transition-all"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <NextImage src={item.preview} alt={item.file.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)} aria-label="Remove image">
                                        <X className="h-5 w-5"/>
                                    </Button>
                                </div>
                                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                  {index + 1}
                                </div>
                            </div>
                        ))}
                        <Card 
                            onClick={onBrowseClick}
                            onDragEnter={handleGlobalDrag} onDragLeave={handleGlobalDrag} onDragOver={handleGlobalDrag} onDrop={handleGlobalDrop}
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
            </Card>
        </div>
          
        <div className="sticky top-20 self-start">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="page-size" className="text-base">Page Size</Label>
                            <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeOption)}>
                              <SelectTrigger id="page-size" className="w-full">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fit">Fit to Image</SelectItem>
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
            </Card>
        </div>
      </div>
    </div>
  );
}
