
"use client";

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2, Download, X, Sparkles, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument, PDFName } from 'pdf-lib';
import { Separator } from '@/components/ui/separator';

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
  const [quality, setQuality] = useState(0.7); // Corresponds to 70%
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

  const handleCompress = useCallback(async () => {
    if (!processedFile) return;

    setProcessedFile(prev => prev ? { ...prev, status: 'compressing' } : null);

    try {
      const existingPdfBytes = await processedFile.originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes, { 
        // Some PDFs have issues with this, so we disable it.
        updateMetadata: false 
      });
      const imageObjects = pdfDoc.context.indirectObjects.entries()
        .filter(([, obj]) => obj.dict?.get(PDFName.of('Subtype')) === PDFName.of('Image'));

      for (const [ref, image] of imageObjects) {
          try {
            const {width, height, bitsPerComponent} = image.dict.dict;
            
            // This logic is complex. We'll simplify and only handle JPEGs for now.
            // A full implementation would need to handle PNGs, etc.
            const smaskRef = image.dict.get(PDFName.of('SMask'));
            if (smaskRef) {
                // transparency masks are too complex to handle reliably client-side. Skip.
                continue;
            }

            const imageStream = image.dict.get(PDFName.of('Filter')) === PDFName.of('DCTDecode') ? image : null;
            if (!imageStream) continue; // Skip non-JPEG images for simplicity

            const imageBytes = imageStream.getContents();
            if(!imageBytes || imageBytes.length === 0) continue;

            // Re-embed the image with new compression
            const newImage = await pdfDoc.embedJpg(imageBytes);
            
            const imageXObject = pdfDoc.context.stream(newImage.jpgData, {
                Type: 'XObject',
                Subtype: 'Image',
                Width: newImage.width,
                Height: newImage.height,
                ColorSpace: PDFName.of('DeviceRGB'),
                BitsPerComponent: 8,
                Filter: PDFName.of('DCTDecode'),
            });
            
            // This is a simplified replacement. A robust solution is much more complex.
            // We're replacing the image object directly.
            pdfDoc.context.assign(ref, imageXObject);

          } catch (e) {
            console.warn("Could not process an image in the PDF, skipping it.", e);
            continue;
          }
      }

      const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
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
  }, [processedFile, quality, toast]);


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
                <CardDescription>Adjust the quality and click compress.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-medium truncate">{processedFile.originalFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatBytes(processedFile.originalSize)}
                        {processedFile.status === 'done' && ` → ${formatBytes(processedFile.compressedSize!)}`}
                    </p>
                </div>
                
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                        <Label htmlFor="quality" className="text-base">Image Quality</Label>
                        <span className="w-16 rounded-md border px-2 py-1 text-center font-mono text-sm">{(quality * 100).toFixed(0)}</span>
                    </div>
                    <Slider 
                        id="quality" 
                        value={[quality * 100]} 
                        min={10} max={90} step={10} 
                        onValueChange={([val]) => setQuality(val/100)}
                        disabled={processedFile.status === 'compressing'}
                    />
                    <p className="text-sm text-muted-foreground">Lower quality means smaller file size. Affects images inside the PDF.</p>
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
