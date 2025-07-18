
"use client";

import { useState, useEffect, useRef, useCallback, DragEvent as ReactDragEvent } from 'react';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import type { Peer, DataConnection } from 'peerjs';
import { Download, Loader2, Smartphone, Wifi, WifiOff, X, PlusCircle, ScanLine } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface ScannedImage {
    id: string;
    dataUrl: string;
}

const ScanIllustration = () => (
    <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-muted-foreground/50">
        <path d="M72.2348 75.0001C72.2348 88.7517 61.2132 99.7733 47.4616 99.7733C33.71 99.7733 22.6885 88.7517 22.6885 75.0001C22.6885 61.2484 33.71 50.2268 47.4616 50.2268C61.2132 50.2268 72.2348 61.2484 72.2348 75.0001Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M47.4619 86.6666C54.0019 86.6666 59.3567 81.3118 59.3567 74.7718C59.3567 68.2318 54.0019 62.877 47.4619 62.877C40.9219 62.877 35.5671 68.2318 35.5671 74.7718C35.5671 81.3118 40.9219 86.6666 47.4619 86.6666Z" stroke="currentColor" strokeWidth="2"/>
        <mask id="mask0_803_2" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="79" y="50" width="100" height="50">
            <path d="M79.522 75L179.043 50.4782V100.478L79.522 75Z" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_803_2)">
        </g>
        <rect x="184.28" y="47" width="46.8511" height="90" rx="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M189.232 54.2174H226.178" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M197.872 106.848C194.846 106.848 192.383 104.385 192.383 101.359V86.1957C192.383 83.17 194.846 80.7066 197.872 80.7066H215.148C218.174 80.7066 220.637 83.17 220.637 86.1957V101.359C220.637 104.385 218.174 106.848 215.148 106.848H197.872Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M228.093 92.2174C231.259 87.0853 231.259 80.4147 228.093 75.2826" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export default function ScanToPdf() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoadingQr, setIsLoadingQr] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [scannedImages, setScannedImages] = useState<ScannedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const { toast } = useToast();

  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  useEffect(() => {
    let peerInstance: Peer | null = null;
    
    const initializePeer = async () => {
        try {
            const { default: Peer } = await import('peerjs');
            const peerId = 'losslessleap-scan-' + Math.random().toString(36).substring(2, 11);
            peerInstance = new Peer(peerId);
            peerRef.current = peerInstance;

            setConnectionStatus('connecting');

            peerInstance.on('open', (id) => {
                const url = `${window.location.origin}/mobile-scanner?peerId=${id}`;
                QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 2, width: 256, color: { dark: '#020817', light: '#00000000' }})
                    .then(setQrCodeUrl)
                    .catch(err => {
                        console.error('QR Code generation failed:', err);
                        toast({ variant: 'destructive', title: 'Could not generate QR code.' });
                        setConnectionStatus('error');
                    })
                    .finally(() => setIsLoadingQr(false));
            });

            peerInstance.on('connection', (conn) => {
                connRef.current = conn;
                setConnectionStatus('connected');
                toast({ title: 'Device Connected!', description: 'You can now start scanning documents on your mobile.' });

                conn.on('data', (data: any) => {
                    if (data.type === 'image' && data.payload) {
                        setScannedImages(prev => [...prev, { id: `img-${Date.now()}`, dataUrl: data.payload }]);
                    }
                });

                conn.on('close', () => {
                    setConnectionStatus('disconnected');
                    toast({ variant: 'destructive', title: 'Device Disconnected' });
                    connRef.current = null;
                });
            });

            peerInstance.on('error', (err) => {
                console.error('PeerJS error:', err);
                setConnectionStatus('error');
                toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not establish a peer-to-peer connection.' });
            });

        } catch (error) {
            console.error('Failed to load PeerJS', error);
            setConnectionStatus('error');
        }
    };
    
    initializePeer();

    return () => {
        connRef.current?.close();
        peerRef.current?.destroy();
    };
  }, [toast]);
  
  const handleDragStart = (e: ReactDragEvent, index: number) => { dragItemRef.current = index; };
  const handleDragEnter = (e: ReactDragEvent, index: number) => { dragOverItemRef.current = index; };
  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null) {
      const newQueue = [...scannedImages];
      const dragItem = newQueue.splice(dragItemRef.current, 1)[0];
      newQueue.splice(dragOverItemRef.current, 0, dragItem);
      setScannedImages(newQueue);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };
  const handleDragOver = (e: ReactDragEvent) => e.preventDefault();

  const removeImage = (id: string) => {
    setScannedImages(prev => prev.filter(item => item.id !== id));
  };
  
  const createPdf = async () => {
    if (scannedImages.length === 0) {
      toast({ variant: "destructive", title: "No images scanned", description: "Please scan at least one document." });
      return;
    }
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      for (const item of scannedImages) {
        const imageBytes = await fetch(item.dataUrl).then(res => res.arrayBuffer());
        const image = await pdfDoc.embedPng(imageBytes);
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scanned-document.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Creation Error:", error);
      toast({ variant: "destructive", title: "Failed to create PDF" });
    } finally {
      setIsProcessing(false);
    }
  };


  if (scannedImages.length === 0) {
    return (
        <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground">1. Scan QR Code</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                    Use your phone's camera to scan this QR code to connect.
                </p>
                <div className="relative aspect-square max-w-xs mx-auto flex items-center justify-center">
                    {isLoadingQr && <Skeleton className="absolute inset-0 rounded-lg" />}
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code to scan" className="w-full h-full object-contain" />}
                </div>
            </Card>
            
            <div className="p-8 text-center md:text-left">
                <h3 className="text-xl font-semibold text-foreground">2. Follow Instructions</h3>
                <div className="mt-2 mb-6">
                    <Badge variant={connectionStatus === 'connected' ? "default": "secondary"} className={connectionStatus === 'connected' ? "bg-green-100 text-green-800" : ""}>
                        {connectionStatus === 'connected' ? <><Wifi className="mr-2 h-4 w-4"/> Connected</> : <><WifiOff className="mr-2 h-4 w-4"/> {connectionStatus}</>}
                    </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                    Follow instructions on your mobile screen. Scanned images will appear here automatically.
                </p>
                <p className="text-muted-foreground mb-8">
                    Do not close this tab.
                </p>
                <ScanIllustration />
            </div>
        </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Scanned Documents</CardTitle>
          <CardDescription>You have scanned {scannedImages.length} image(s). Drag to reorder, then save as PDF.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8" onDragOver={handleDragOver}>
                {scannedImages.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="relative group aspect-[3/4] cursor-grab rounded-lg overflow-hidden border"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                    >
                        <NextImage src={item.dataUrl} alt={`Scanned image ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="icon" variant="destructive" onClick={() => removeImage(item.id)} aria-label="Remove image">
                                <X className="h-5 w-5"/>
                            </Button>
                        </div>
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 border-t">
                <div className="flex items-center text-muted-foreground">
                    <Smartphone className="mr-3 h-8 w-8 text-primary"/>
                    <div>
                        <p className="font-medium text-foreground">Device Connected</p>
                        <p className="text-sm">Ready to receive more scans.</p>
                    </div>
                </div>
                <Button onClick={createPdf} size="lg" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5"/>}
                    {isProcessing ? "Creating PDF..." : `Save ${scannedImages.length} Image(s) as PDF`}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
