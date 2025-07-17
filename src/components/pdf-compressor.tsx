
"use client";

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2, Download, X, Sparkles, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, PDFImage, PDFName } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

interface ProcessedFile {
  originalFile: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number | null;
  status: 'idle' | 'compressing' | 'done' | 'error';
  error?: string;
}

export default function PdfCompressor() {
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleReset = useCallback(() => {
    setProcessedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
      });
      return;
    }
    setProcessedFile({
      originalFile: file,
      originalSize: file.size,
      compressedBlob: null,
      compressedSize: null,
      status: 'idle',
    });
  };

  const compressPdfImage = async (image: PDFImage, quality: number): Promise<Uint8Array> => {
    const imageBytes = await image.embed();
    const file = new Blob([imageBytes]);
    const compressedFile = await imageCompression(file as File, {
      maxSizeMB: Infinity,
      maxWidthOrHeight: image.width,
      useWebWorker: true,
      initialQuality: quality / 100,
      fileType: 'image/jpeg',
    });
    return new Uint8Array(await compressedFile.arrayBuffer());
  };


  const handleCompress = useCallback(async () => {
    if (!processedFile) return;

    setProcessedFile(prev => prev ? { ...prev, status: 'compressing' } : null);
    
    const quality = 75; // Use a fixed quality

    try {
      const existingPdfBytes = await processedFile.originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes, { 
        updateMetadata: false 
      });

      const processedRefs = new Set();

      for (const page of pdfDoc.getPages()) {
        const imageNames = page.node.Resources?.XObject?.keys() ?? [];
        
        for (const name of imageNames) {
          const xobject = page.node.Resources!.XObject!.lookup(name);
          if(xobject.get(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;

          const ref = xobject.ref;
          if (processedRefs.has(ref.toString())) continue;

          try {
            const image = await pdfDoc.embedJpg(await (pdfDoc.getForm().getButton(name.decodeText())).acroField.getImage());
            const compressedImageBytes = await compressPdfImage(image, quality);
            const compressedImage = await pdfDoc.embedJpg(compressedImageBytes);
            page.drawImage(compressedImage, {
               x: page.getWidth() / 2 - compressedImage.width / 2,
               y: page.getHeight() / 2 - compressedImage.height / 2,
            });
            
            const imageXObject = pdfDoc.context.stream(compressedImage.jpgData, {
                Type: 'XObject',
                Subtype: 'Image',
                Width: compressedImage.width,
                Height: compressedImage.height,
                ColorSpace: PDFName.of('DeviceRGB'),
                BitsPerComponent: 8,
                Filter: PDFName.of('DCTDecode'),
            });
            page.node.set(PDFName.of(name.decodeText()), imageXObject);

          } catch (e) {
            console.warn("Could not process an image in the PDF, skipping it.", e);
            continue;
          }
          processedRefs.add(ref.toString());
        }
      }

      const compressedPdfBytes = await pdfDoc.save();
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      
      setProcessedFile(prev => prev ? {
        ...prev,
        compressedBlob: blob,
        compressedSize: blob.size,
        status: 'done'
      } : null);

    } catch (error) {
      console.error("PDF Compression Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      setProcessedFile(prev => prev ? { ...prev, status: 'error', error: errorMessage } : null);
      toast({
        variant: 'destructive',
        title: 'Failed to compress PDF',
        description: "The file might be corrupted or in an unsupported format.",
      });
    }
  }, [processedFile, toast]);


  const handleDownload = () => {
    if (!processedFile?.compressedBlob) return;
    const url = URL.createObjectURL(processedFile.compressedBlob);
    const a = document.createElement('a');
a.href = url;
    const originalName = processedFile.originalFile.name.split('.').slice(0, -1).join('.') || 'compressed';
    a.download = `${originalName}-compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files); };
  const onBrowseClick = () => { inputRef.current?.click(); };
  
  if (!processedFile) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors mx-auto", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="application/pdf" />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your PDF here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} className="mt-4">
            Browse File
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Upload a PDF to reduce its file size.</p>
        </CardContent>
      </Card>
    );
  }

  const reduction = processedFile.originalSize && processedFile.compressedSize ? ((processedFile.originalSize - processedFile.compressedSize) / processedFile.originalSize) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Compress PDF</CardTitle>
                <CardDescription>Click compress to reduce your file size.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-medium truncate">{processedFile.originalFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatBytes(processedFile.originalSize)}
                        {processedFile.status === 'done' && ` → ${formatBytes(processedFile.compressedSize!)}`}
                    </p>
                </div>
                
                {processedFile.status === 'done' && (
                   <div className="p-4 text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Compression Complete!</h3>
                       <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                        Saved {reduction.toFixed(1)}%
                      </p>
                   </div>
                )}
                 {processedFile.status === 'error' && (
                   <div className="p-4 text-center bg-destructive/10 border border-destructive/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-destructive">Compression Failed</h3>
                       <p className="mt-1 text-sm text-muted-foreground">
                        Could not process the PDF. It may be encrypted, corrupted, or use unsupported features.
                      </p>
                   </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                     {processedFile.status !== 'done' ? (
                        <Button onClick={handleCompress} size="lg" disabled={processedFile.status === 'compressing'}>
                            {processedFile.status === 'compressing' ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-5 w-5" />
                            )}
                            {processedFile.status === 'compressing' ? "Compressing..." : "Compress PDF"}
                        </Button>
                     ) : (
                        <Button onClick={handleDownload} size="lg">
                            <Download className="mr-2 h-5 w-5"/>
                            Download Compressed PDF
                        </Button>
                     )}
                    <Button onClick={handleReset} variant="outline" size="lg" disabled={processedFile.status === 'compressing'}>
                        <X className="mr-2 h-5 w-5" />
                        Clear & Start Over
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
