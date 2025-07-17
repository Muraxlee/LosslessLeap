
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Loader2, Download, X, XCircle, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

interface ImageQueueItem {
  id: string;
  file: File;
  preview: string;
}

export default function ImageToPdf() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
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
            description: `Only JPG and PNG images are supported for PDF conversion. Skipped: ${file.name}`,
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
    const itemToRemove = imageQueue.find(item => item.id === id);
    if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.preview);
    }
    setImageQueue(prev => prev.filter(item => item.id !== id));
  };

  const createPdf = async () => {
    if (imageQueue.length === 0) {
      toast({
        variant: "destructive",
        title: "No images selected",
        description: "Please add images to create a PDF.",
      });
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
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
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
      toast({
        variant: "destructive",
        title: "Failed to create PDF",
        description: "An unexpected error occurred. Please try again.",
      });
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
    <div className="w-full max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileImage className="text-primary"/> Image to PDF Converter</CardTitle>
                <CardDescription>Arrange images in the desired order and click "Create PDF" to combine them.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {imageQueue.map(item => (
                        <div key={item.id} className="relative group aspect-square">
                            <NextImage src={item.preview} alt={item.file.name} fill className="object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)}>
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
                
                <div className="flex justify-end gap-4">
                    <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                        <X className="mr-2 h-5 w-5" />
                        Clear All
                    </Button>
                    <Button onClick={createPdf} size="lg" disabled={isProcessing}>
                        {isProcessing ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-5 w-5"/>
                        )}
                        {isProcessing ? "Creating PDF..." : "Create PDF"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
