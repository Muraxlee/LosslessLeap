"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, FileImage, Loader2, Download, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const [quality, setQuality] = useState(75);
  const [isCompressing, setIsCompressing] = useState(false);
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
    setOriginalFile(null);
    setOriginalPreview(null);
    setOriginalSize(null);
    setImageDimensions(null);
    setCompressedBlob(null);
    setCompressedPreview(null);
    setCompressedSize(null);
    setIsCompressing(false);
    setQuality(75);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleReset();
      setOriginalFile(file);
      setOriginalSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = document.createElement('img');
          img.onload = () => {
              setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);

      const previewUrl = URL.createObjectURL(file);
      setOriginalPreview(previewUrl);

    } else if (file) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a valid image file (PNG, JPG, WebP).",
      });
    }
  }, [handleReset, toast]);

  const compressImage = useCallback(async () => {
    if (!originalFile || !imageDimensions) return;

    setIsCompressing(true);
    setCompressedBlob(null);
    setCompressedPreview(null);
    setCompressedSize(null);

    const img = document.createElement('img');
    const promise = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const previewUrl = URL.createObjectURL(originalFile);
    img.src = previewUrl;

    try {
        await promise;
        URL.revokeObjectURL(previewUrl);

        const canvas = document.createElement('canvas');
        canvas.width = imageDimensions.width;
        canvas.height = imageDimensions.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedBlob(blob);
              setCompressedSize(blob.size);
              setCompressedPreview(URL.createObjectURL(blob));
            }
            setIsCompressing(false);
          },
          'image/jpeg',
          quality / 100
        );
    } catch (error) {
        console.error("Image compression error:", error);
        toast({
            variant: "destructive",
            title: "Compression Failed",
            description: "Something went wrong while compressing the image.",
        });
        setIsCompressing(false);
    }
  }, [originalFile, imageDimensions, quality, toast]);

  useEffect(() => {
    if (originalFile && imageDimensions) {
      const timer = setTimeout(() => compressImage(), 500);
      return () => clearTimeout(timer);
    }
  }, [originalFile, imageDimensions, quality, compressImage]);

  const handleDownload = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = originalFile?.name.split('.').slice(0, -1).join('.') || 'compressed';
    a.download = `${originalName}-compressed.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    }
  }, [originalPreview, compressedPreview]);

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true); else if (e.type === "dragleave") setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileChange({ target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>); } };
  const onBrowseClick = () => { inputRef.current?.click(); };

  if (!originalFile) {
    return (
      <Card
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={cn("w-full max-w-lg border-2 border-dashed transition-colors", isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/50")}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input ref={inputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
          <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold text-foreground">Drag & drop an image here</p>
          <p className="mt-1 text-sm text-muted-foreground">or</p>
          <Button onClick={onBrowseClick} variant="outline" className="mt-4">
            Browse Files
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PNG, JPG, and WebP</p>
        </CardContent>
      </Card>
    );
  }

  const reduction = originalSize && compressedSize ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

  return (
    <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
                <CardHeader><CardTitle>Original</CardTitle></CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                      {originalPreview && imageDimensions && <Image src={originalPreview} alt="Original image preview" width={imageDimensions.width} height={imageDimensions.height} className="h-full w-full object-contain" />}
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <p className="max-w-[70%] truncate font-medium text-foreground">{originalFile.name}</p>
                        <p className="font-mono text-muted-foreground">{formatBytes(originalSize ?? 0)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Compressed</span>
                        {reduction > 0 && (
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                -{reduction.toFixed(1)}%
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                        {isCompressing && (
                            <div className="flex h-full w-full items-center justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        )}
                        {!isCompressing && compressedPreview && imageDimensions && (
                            <Image src={compressedPreview} alt="Compressed image preview" width={imageDimensions.width} height={imageDimensions.height} className="h-full w-full object-contain" />
                        )}
                        {!isCompressing && !compressedPreview && (
                            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                                <FileImage className="h-12 w-12" />
                                <p className="mt-2 text-sm">Compressed preview</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                        <p className="max-w-[70%] truncate font-medium text-foreground">
                            {originalFile?.name.split('.').slice(0, -1).join('.') || 'compressed'}.jpg
                        </p>
                        <p className="font-mono text-muted-foreground">{formatBytes(compressedSize ?? 0)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Compression Settings</CardTitle>
                <CardDescription>Adjust the quality to find the right balance between file size and image clarity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="quality" className="text-base">Quality</Label>
                        <span className="w-16 rounded-md border px-2 py-1 text-center font-mono text-sm">{quality}</span>
                    </div>
                    <Slider id="quality" defaultValue={[quality]} min={0} max={100} step={1} onValueChange={(value) => setQuality(value[0])} />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <Button onClick={handleDownload} disabled={!compressedBlob || isCompressing} size="lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg">
                        <X className="mr-2 h-5 w-5" />
                        Compress Another
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
