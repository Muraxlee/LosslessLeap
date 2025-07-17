
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Loader2, Download, X, XCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

type OutputFormat = 'png' | 'jpeg' | 'webp';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageQueueItem {
  id: string;
  originalFile: File;
  originalPreview: string;
  originalSize: number;
  imageDimensions: ImageDimensions | null;
  convertedBlob: Blob | null;
  convertedSize: number | null;
  status: 'queued' | 'converting' | 'done' | 'error';
  error?: string;
}

export default function ImageConverter() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('webp');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef(imageQueue);
  queueRef.current = imageQueue;

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
    queueRef.current.forEach(item => URL.revokeObjectURL(item.originalPreview));
    setImageQueue([]);
    setIsProcessingQueue(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  useEffect(() => {
    return () => {
      queueRef.current.forEach(item => URL.revokeObjectURL(item.originalPreview));
    };
  }, []);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    queueRef.current.forEach(item => URL.revokeObjectURL(item.originalPreview));

    const newItems: ImageQueueItem[] = [];
    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `Skipped non-image file: ${file.name}`,
        });
        continue;
      }
      
      const id = `${file.name}-${file.lastModified}-${file.size}`;
      const originalPreview = URL.createObjectURL(file);
      
      try {
        const imageDimensions = await new Promise<ImageDimensions>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => reject(new Error('Could not load image dimensions.'));
          img.src = originalPreview;
        });

        newItems.push({
          id,
          originalFile: file,
          originalPreview,
          originalSize: file.size,
          imageDimensions,
          convertedBlob: null,
          convertedSize: null,
          status: 'queued',
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Could not process file", description: file.name });
        URL.revokeObjectURL(originalPreview);
      }
    }
    setImageQueue(newItems);
  }, [toast]);
  
  const convertImage = useCallback(async (item: ImageQueueItem, format: OutputFormat): Promise<Partial<ImageQueueItem>> => {
    if (!item.imageDimensions) {
      return { status: 'error', error: 'Missing image dimensions.' };
    }
  
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = (err) => reject(new Error('Image could not be loaded for conversion.'));
          image.src = item.originalPreview;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
  
      const mimeType = `image/${format}`;
      const quality = format === 'jpeg' ? 0.92 : 1.0;

      const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, mimeType, quality);
      });
  
      if (blob) {
          return { convertedBlob: blob, convertedSize: blob.size, status: 'done' };
      } else {
          return { status: 'error', error: 'Canvas toBlob failed.' };
      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { status: 'error', error: errorMessage };
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue) return;
    setIsProcessingQueue(true);

    const queueToProcess = imageQueue.filter(item => item.status === 'queued');

    for (const item of queueToProcess) {
      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'converting' } : i));
      const result = await convertImage(item, outputFormat);
      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, ...result } : i));
    }

    setIsProcessingQueue(false);
  }, [imageQueue, outputFormat, convertImage, isProcessingQueue]);
  
  useEffect(() => {
    const hasQueue = imageQueue.length > 0 && imageQueue.some(i => i.status === 'queued');
    if (hasQueue && !isProcessingQueue) {
      const timer = setTimeout(processQueue, 300);
      return () => clearTimeout(timer);
    }
  }, [imageQueue, processQueue, isProcessingQueue]);

  const handleFormatChange = (newFormat: OutputFormat) => {
    setOutputFormat(newFormat);
    if(imageQueue.length > 0){
        setIsProcessingQueue(false);
        setImageQueue(prev => prev.map(i => i.status === 'error' ? i : {
            ...i,
            status: 'queued',
            convertedBlob: null,
            convertedSize: null,
            error: undefined,
        }));
    }
  };

  const handleDownload = (item: ImageQueueItem) => {
    if (!item.convertedBlob) return;
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = item.originalFile.name.split('.').slice(0, -1).join('.') || 'converted';
    a.download = `${originalName}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    imageQueue.forEach(item => {
      if (item.status === 'done') handleDownload(item);
    });
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
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <input ref={inputRef} type="file" onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/png, image/jpeg, image/webp" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} className="mt-4">Browse Files</Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PNG, JPG, and WebP</p>
        </CardContent>
      </Card>
    );
  }
  
  const allDone = imageQueue.every(i => i.status === 'done' || i.status === 'error');
  const anyDone = imageQueue.some(i => i.status === 'done');

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Queue</CardTitle>
                <CardDescription>{imageQueue.length} image(s) to convert. { isProcessingQueue ? 'Converting...' : (allDone ? 'Done!' : '') }</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {imageQueue.map(item => (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <NextImage src={item.originalPreview} alt={item.originalFile.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="truncate font-medium text-foreground">{item.originalFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(item.originalSize)}
                          {item.convertedSize !== null && ` → ${formatBytes(item.convertedSize)}`}
                        </p>
                      </div>
                      <div className="flex w-32 flex-shrink-0 items-center justify-end gap-2">
                          {item.status === 'converting' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                          {item.status === 'done' && (
                            <Button size="icon" variant="ghost" onClick={() => handleDownload(item)} aria-label="Download image"><Download className="h-5 w-5"/></Button>
                          )}
                           {item.status === 'error' && (
                            <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="h-6 w-6" />
                                <span className="text-sm">Failed</span>
                            </div>
                           )}
                          {item.status === 'queued' && <span className="text-sm text-muted-foreground">Queued</span>}
                      </div>
                    </div>
                  ))}
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
                  <div className="grid gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="format" className="text-base">Output Format</Label>
                          <Select value={outputFormat} onValueChange={(v) => handleFormatChange(v as OutputFormat)}>
                            <SelectTrigger id="format" className="w-full">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="jpeg">JPEG</SelectItem>
                              <SelectItem value="webp">WebP</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                  </div>
                  
                  <Separator className="my-6" />

                  <div className="flex flex-col gap-3">
                      <Button onClick={handleDownloadAll} size="lg" disabled={!anyDone || isProcessingQueue}>
                          <Download />
                          Download All
                      </Button>
                      <Button onClick={handleReset} variant="outline" size="lg">
                          <X className="mr-2 h-5 w-5" />
                          Clear & Start Over
                      </Button>
                  </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
