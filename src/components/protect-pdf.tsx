
"use client";

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2, Download, X, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PDFDocument } from 'pdf-lib';

export default function ProtectPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPassword('');
    setConfirmPassword('');
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file.",
      });
      return;
    }
    setPdfFile(file);
  };
  
  const handleProtectPdf = async () => {
    if (!pdfFile) {
        toast({ variant: "destructive", title: "No PDF file selected." });
        return;
    }
    if (!password) {
        toast({ variant: "destructive", title: "Password is required." });
        return;
    }
    if (password !== confirmPassword) {
        toast({ variant: "destructive", title: "Passwords do not match." });
        return;
    }
    
    setIsProcessing(true);
    
    try {
        const existingPdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

        const protectedPdfBytes = await pdfDoc.save({ 
            encrypt: {
                userPassword: password,
                ownerPassword: password,
            }
        });

        const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = pdfFile.name.split('.').slice(0, -1).join('.') || 'protected';
        a.download = `${originalName}-protected.pdf`;
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
            title: "PDF Protected Successfully",
            description: "Your download has started.",
        });
        
        // After success, reset to allow another file
        handleReset();

    } catch (error) {
        console.error("PDF Protection Error:", error);
        toast({
            variant: "destructive",
            title: "Failed to Protect PDF",
            description: "The file might be corrupted or in an unsupported format."
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const onBrowseClick = () => {
    inputRef.current?.click();
  };

  if (!pdfFile) {
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
          <p className="mt-4 text-xs text-muted-foreground">Upload a PDF to add password protection</p>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Protect PDF</CardTitle>
                <CardDescription>Set a password for your PDF file.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-medium truncate">{pdfFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(pdfFile.size)}</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                        id="confirm-password" 
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Button onClick={handleProtectPdf} size="lg" disabled={isProcessing || !password || password !== confirmPassword}>
                        {isProcessing ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Lock className="mr-2 h-5 w-5" />
                        )}
                        {isProcessing ? "Protecting..." : "Protect & Download PDF"}
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="lg" disabled={isProcessing}>
                        <X className="mr-2 h-5 w-5" />
                        Clear & Start Over
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
