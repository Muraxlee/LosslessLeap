
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import { UploadCloud, Loader2, Download, X, Sparkles, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
  compressedBlob: Blob | null;
  compressedSize: number | null;
  status: 'queued' | 'compressing' | 'done' | 'error';
  error?: string;
}

export default function ImageCompressor() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [quality, setQuality] = useState(75);
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
    queueRef.current.forEach(item => {
      if (item.originalPreview) URL.revokeObjectURL(item.originalPreview);
    });
    setImageQueue([]);
    setIsProcessingQueue(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    // This is a cleanup effect that runs when the component unmounts.
    return () => {
      queueRef.current.forEach(item => {
        if (item.originalPreview) URL.revokeObjectURL(item.originalPreview);
      });
    };
  }, []);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Clear previous queue and revoke old URLs before adding new files
    handleReset();
    
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
          const img = document.createElement('img');
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = (err) => reject(new Error('Could not load image dimensions.'));
          img.src = originalPreview;
        });

        newItems.push({
          id,
          originalFile: file,
          originalPreview,
          originalSize: file.size,
          imageDimensions,
          compressedBlob: null,
          compressedSize: null,
          status: 'queued',
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Could not process file",
          description: file.name,
        });
        URL.revokeObjectURL(originalPreview);
      }
    }
    setImageQueue(newItems);
  }, [toast, handleReset]);
  
  const compressImage = useCallback(async (item: ImageQueueItem, compressionQuality: number): Promise<Partial<ImageQueueItem>> => {
    if (!item.originalFile || !item.imageDimensions) {
      return { status: 'error', error: 'Missing file or dimensions.' };
    }
  
    return new Promise((resolvePromise) => {
      const img = new window.Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = item.imageDimensions!.width;
          canvas.height = item.imageDimensions!.height;
          const ctx = canvas.getContext('2d');
      
          if (!ctx) throw new Error("Could not get canvas context");
          ctx.drawImage(img, 0, 0);
      
          const mimeType = 'image/webp';
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, mimeType, compressionQuality / 100);
          });
      
          if (blob) {
            resolvePromise({
              compressedBlob: blob,
              compressedSize: blob.size,
              status: 'done'
            });
          } else {
            resolvePromise({ status: 'error', error: 'Canvas toBlob failed.' });
          }
        } catch (error) {
            console.error("Image compression error:", error);
            resolvePromise({ status: 'error', error: 'Compression failed.' });
        }
      };
      img.onerror = () => {
        console.error("Image load failed for compression:", item.originalPreview);
        resolvePromise({ status: 'error', error: 'Image load failed.' });
      };
      img.src = item.originalPreview;
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue) return;
    setIsProcessingQueue(true);

    const queueToProcess = imageQueue.filter(item => item.status === 'queued');

    for (const item of queueToProcess) {
      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'compressing' } : i));
      const result = await compressImage(item, quality);
      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, ...result } : i));
    }

    setIsProcessingQueue(false);
  }, [imageQueue, quality, compressImage, isProcessingQueue]);
  
  useEffect(() => {
    const hasQueue = imageQueue.length > 0 && imageQueue.some(i => i.status === 'queued');
    if (hasQueue && !isProcessingQueue) {
      const timer = setTimeout(processQueue, 300);
      return () => clearTimeout(timer);
    }
  }, [imageQueue, processQueue, isProcessingQueue]);

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if(imageQueue.length > 0){
        setIsProcessingQueue(false);
        setImageQueue(prev => prev.map(i => i.status === 'error' ? i : {
            ...i,
            status: 'queued',
            compressedBlob: null,
            compressedSize: null,
            error: undefined,
        }));
    }
  };

  const handleDownload = (item: ImageQueueItem) => {
    if (!item.compressedBlob) return;
    const url = URL.createObjectURL(item.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = item.originalFile.name.split('.').slice(0, -1).join('.') || 'compressed';
    a.download = `${originalName}-compressed.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    imageQueue.forEach(item => {
      if (item.status === 'done') {
        handleDownload(item);
      }
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
          <Button onClick={onBrowseClick} className="mt-4">
            Browse Files
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PNG, JPG, and WebP</p>
        </CardContent>
      </Card>
    );
  }
  
  const totalOriginalSize = imageQueue.reduce((acc, item) => acc + item.originalSize, 0);
  const totalCompressedSize = imageQueue.reduce((acc, item) => acc + (item.compressedSize ?? 0), 0);
  const totalReduction = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;
  const allDone = imageQueue.every(i => i.status === 'done' || i.status === 'error');
  const anyDone = imageQueue.some(i => i.status === 'done');

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Queue</CardTitle>
                <CardDescription>{imageQueue.length} image(s) in queue. { isProcessingQueue ? 'Compressing...' : (allDone ? 'Done!' : '') }</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {imageQueue.map(item => {
                    const reduction = item.originalSize && item.compressedSize ? ((item.originalSize - item.compressedSize) / item.originalSize) * 100 : 0;
                    return (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <NextImage src={item.originalPreview} alt={item.originalFile.name} fill className="object-cover" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="truncate font-medium text-foreground">{item.originalFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(item.originalSize)}
                          {item.compressedSize !== null && ` → ${formatBytes(item.compressedSize)}`}
                        </p>
                      </div>
                      <div className="flex w-32 flex-shrink-0 items-center justify-end gap-2">
                          {item.status === 'compressing' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                          {item.status === 'done' && (
                            <>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">-{reduction.toFixed(0)}%</span>
                              <Button size="icon" variant="ghost" onClick={() => handleDownload(item)} aria-label="Download image"><Download className="h-5 w-5"/></Button>
                            </>
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
                  )})}
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
                    <div className="flex items-center justify-between">
                        <Label htmlFor="quality" className="text-base">Quality</Label>
                        <span className="w-16 rounded-md border px-2 py-1 text-center font-mono text-sm">{quality}</span>
                    </div>
                    <Slider 
                      id="quality" 
                      value={[quality]} 
                      min={0} max={100} step={1} 
                      onValueChange={([val]) => setQuality(val)}
                      onValueCommit={([val]) => handleQualityChange(val)}
                      disabled={isProcessingQueue && !allDone}
                    />
                </div>
                
                {allDone && totalCompressedSize > 0 && (
                   <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-lg font-semibold">Total Savings</h3>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Original: <span className="font-medium text-foreground">{formatBytes(totalOriginalSize)}</span></p>
                        <p>Compressed: <span className="font-medium text-foreground">{formatBytes(totalCompressedSize)}</span></p>
                      </div>
                       <p className="mt-2 text-xl font-bold text-green-600 dark:text-green-400">
                        Saved {totalReduction.toFixed(1)}%
                      </p>
                    </div>
                   </>
                )}

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
