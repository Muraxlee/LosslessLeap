
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, FileImage, Loader2, Download, X, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
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
  const { toast } = useToast();

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleReset = useCallback(() => {
    // Revoke all object URLs
    imageQueue.forEach(item => {
      if (item.originalPreview) URL.revokeObjectURL(item.originalPreview);
      if (item.compressedBlob) URL.revokeObjectURL(URL.createObjectURL(item.compressedBlob));
    });
    setImageQueue([]);
    setIsProcessingQueue(false);
    setQuality(75);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [imageQueue]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleReset();
      const newItems: ImageQueueItem[] = [];
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          const id = `${file.name}-${file.lastModified}`;
          const originalPreview = URL.createObjectURL(file);
          const imageDimensions = await new Promise<ImageDimensions | null>((resolve) => {
            const img = document.createElement('img');
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve(null);
            img.src = originalPreview;
          });

          if (imageDimensions) {
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
          } else {
            URL.revokeObjectURL(originalPreview); // Clean up if dimension reading fails
          }
        } else {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: `Skipped non-image file: ${file.name}`,
          });
        }
      }
      setImageQueue(newItems);
    }
  }, [handleReset, toast]);

  const compressImage = useCallback(async (item: ImageQueueItem, compressionQuality: number): Promise<Partial<ImageQueueItem>> => {
      if (!item.originalFile || !item.imageDimensions) {
        return { status: 'error', error: 'Missing file or dimensions.' };
      }

      const img = document.createElement('img');
      const promise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      img.src = item.originalPreview;

      try {
          await promise;

          const canvas = document.createElement('canvas');
          canvas.width = item.imageDimensions.width;
          canvas.height = item.imageDimensions.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          ctx.drawImage(img, 0, 0, item.imageDimensions.width, item.imageDimensions.height);

          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', compressionQuality / 100);
          });
          
          if (blob) {
            return {
              compressedBlob: blob,
              compressedSize: blob.size,
              status: 'done'
            };
          } else {
            return { status: 'error', error: 'Canvas toBlob failed.' };
          }
      } catch (error) {
          console.error("Image compression error:", error);
          return { status: 'error', error: 'Compression failed.' };
      }
  }, []);

  const processQueue = useCallback(async () => {
    setIsProcessingQueue(true);
    for (const item of imageQueue) {
      if(item.status !== 'queued') continue;

      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'compressing' } : i));
      const result = await compressImage(item, quality);
      setImageQueue(prev => prev.map(i => i.id === item.id ? { ...i, ...result } : i));
    }
    setIsProcessingQueue(false);
  }, [imageQueue, quality, compressImage]);

  useEffect(() => {
    if (imageQueue.length > 0 && imageQueue.some(i => i.status === 'queued')) {
      const timer = setTimeout(() => processQueue(), 500);
      return () => clearTimeout(timer);
    }
  }, [imageQueue, quality, processQueue]);

  const handleDownload = (item: ImageQueueItem) => {
    if (!item.compressedBlob) return;
    const url = URL.createObjectURL(item.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = item.originalFile.name.split('.').slice(0, -1).join('.') || 'compressed';
    a.download = `${originalName}-compressed.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  useEffect(() => {
    // This effect ensures that object URLs are revoked when the component unmounts.
    return () => {
      imageQueue.forEach(item => {
        if (item.originalPreview) URL.revokeObjectURL(item.originalPreview);
        if (item.compressedBlob) {
            const url = URL.createObjectURL(item.compressedBlob);
            URL.revokeObjectURL(url);
        }
      });
    }
  }, [imageQueue]);

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileChange({ target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>); } };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (imageQueue.length === 0) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" multiple />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">
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

  return (
    <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Queue</CardTitle>
                <CardDescription>{imageQueue.length} image(s) ready for compression.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
                  {imageQueue.map(item => {
                    const reduction = item.originalSize && item.compressedSize ? ((item.originalSize - item.compressedSize) / item.originalSize) * 100 : 0;
                    return (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={item.originalPreview} alt={item.originalFile.name} layout="fill" className="object-cover" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="truncate font-medium text-foreground">{item.originalFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBytes(item.originalSize)}
                          {item.compressedSize !== null && ` → ${formatBytes(item.compressedSize)}`}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-4">
                          {item.status === 'compressing' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                          {item.status === 'done' && (
                            <>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">-{reduction.toFixed(1)}%</span>
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(item)}><Download className="h-5 w-5"/></Button>
                            </>
                          )}
                          {item.status === 'error' && <XCircle className="h-6 w-6 text-destructive" />}
                          {item.status === 'queued' && <span className="text-sm text-muted-foreground">Queued</span>}
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="sticky top-20">
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
                        onValueChange={(value) => setQuality(value[0])}
                        onValueCommit={() => {
                          // Re-process queue with new quality
                          setImageQueue(prev => prev.map(i => ({...i, status: 'queued', compressedBlob: null, compressedSize: null, error: undefined})));
                        }}
                        disabled={isProcessingQueue}
                      />
                  </div>
                  
                  {allDone && totalCompressedSize > 0 && (
                     <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-medium">Total Savings</h3>
                        <p className="text-sm text-muted-foreground">
                          Compressed from {formatBytes(totalOriginalSize)} to {formatBytes(totalCompressedSize)}.
                        </p>
                         <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          Saved {totalReduction.toFixed(1)}%
                        </p>
                      </div>
                     </>
                  )}

                  <Separator className="my-4" />

                  <div className="flex flex-wrap justify-center gap-4">
                      <Button onClick={handleReset} variant="outline" size="lg">
                          <X className="mr-2 h-5 w-5" />
                          Clear Queue
                      </Button>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

    