

'use client';

import type { Metadata } from 'next';
import { useState, useEffect, useRef, useCallback, DragEvent as ReactDragEvent } from 'react';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Peer, DataConnection } from 'peerjs';
import QRCode from 'qrcode';
import { Download, Loader2, Smartphone, Wifi, WifiOff, X, ScanLine, QrCode, Camera } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import AdSenseAd from '@/components/adsense-ad';

// Note: We can't use the 'metadata' export in a 'use client' component.
// SEO for this page should be handled in a parent layout or via other means if needed.

interface ScannedImage {
    id: string;
    dataUrl: string;
}

const ScanIllustration = () => (
    <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-muted-foreground/50">
        <path d="M72.2348 75.0001C72.2348 88.7517 61.2132 99.7733 47.4616 99.7733C33.71 99.7733 22.6885 88.7517 22.6885 75.0001C22.6885 61.2484 33.71 50.2268 47.4616 50.2268C61.2132 50.2268 72.2348 61.2484 72.2348 75.0001Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M47.4619 86.6666C54.0019 86.6666 59.3567 81.3118 59.3567 74.7718C59.3567 68.2318 54.0019 62.877 47.4619 62.877C40.9219 62.877 35.5671 68.2318 35.5671 74.7718C35.5671 81.3118 40.9219 86.6666 47.4619 86.6666Z" stroke="currentColor" strokeWidth="2"/>
        <rect x="184.28" y="47" width="46.8511" height="90" rx="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M189.232 54.2174H226.178" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M197.872 106.848C194.846 106.848 192.383 104.385 192.383 101.359V86.1957C192.383 83.17 194.846 80.7066 197.872 80.7066H215.148C218.174 80.7066 220.637 83.17 220.637 86.1957V101.359C220.637 104.385 218.174 106.848 215.148 106.848H197.872Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M228.093 92.2174C231.259 87.0853 231.259 80.4147 228.093 75.2826" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const steps = [
  {
    icon: QrCode,
    title: 'Scan QR Code',
    description: 'Use your phone\'s camera to scan the QR code and open the link.',
  },
  {
    icon: Camera,
    title: 'Scan with Phone',
    description: 'Take pictures of your documents using your phone\'s browser.',
  },
  {
    icon: Download,
    title: 'Download PDF',
    description: 'Arrange your scans and download them as a single PDF file.',
  },
];


export default function ScanToPdfPage() {
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
        let intervalId: NodeJS.Timeout | null = null;
        
        const initializePeer = async () => {
            // Clean up previous peer instance if it exists
            if (peerInstance) {
                peerInstance.destroy();
            }
            if (connRef.current) {
                connRef.current.close();
            }

            try {
                setIsLoadingQr(true);
                const { default: Peer } = await import('peerjs');
                const peerId = 'losslessleap-scan-desktop-' + Math.random().toString(36).substring(2, 9);
                peerInstance = new Peer(peerId);
                peerRef.current = peerInstance;

                setConnectionStatus('connecting');

                peerInstance.on('open', (id) => {
                    const url = `${window.location.origin}/mobile-scanner#${id}`;
                     QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 2, width: 256, color: { dark: '#020817', light: '#FFFFFF' }})
                        .then(setQrCodeUrl)
                        .catch(err => {
                            console.error('QR Code generation failed:', err);
                            toast({ variant: 'destructive', title: 'Could not generate QR code.' });
                            setConnectionStatus('error');
                        })
                        .finally(() => setIsLoadingQr(false));
                });

                peerInstance.on('connection', (conn) => {
                    if (intervalId) clearInterval(intervalId); // Stop refreshing QR on connection
                    
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
                        initializePeer(); // Re-initialize to get a new QR code
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
        // Refresh QR code every 2 minutes (120000 ms)
        intervalId = setInterval(initializePeer, 120000);

        return () => {
            if (intervalId) clearInterval(intervalId);
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
    
    if (connectionStatus !== 'connected' && scannedImages.length === 0) {
        return (
            <div className="container py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Scan to PDF</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Use your phone camera to scan documents directly to your browser.</p>
                </div>
                 <div className="mx-auto max-w-5xl">
                     <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <step.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mb-8 h-24">
                        <AdSenseAd slot="2414212592" />
                    </div>

                    <Card className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-semibold text-foreground">Connect your Phone</h3>
                                <div className="text-muted-foreground mt-2 mb-6">
                                    <p>Scan the QR code with your mobile device to begin. The code refreshes every 2 minutes.</p>
                                    <Badge variant={connectionStatus === 'connected' ? "default": "secondary"} className={`mt-2 ${connectionStatus === 'connected' ? "bg-green-100 text-green-800" : ""}`}>
                                        {connectionStatus === 'connected' ? <><Wifi className="mr-2 h-4 w-4"/> Connected</> : <><WifiOff className="mr-2 h-4 w-4"/> {connectionStatus}</>}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Your phone and computer must be on the same network.
                                    Do not close this browser tab.
                                </p>
                            </div>
                            <div className="relative aspect-square max-w-xs mx-auto flex items-center justify-center p-4 bg-white rounded-lg">
                                {isLoadingQr && <Skeleton className="absolute inset-4 rounded-lg bg-gray-200" />}
                                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code to scan" className="w-full h-full object-contain" />}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }


    return (
        <div className="container py-8 w-full max-w-7xl mx-auto">
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
