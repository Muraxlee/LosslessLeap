
'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Peer, DataConnection } from 'peerjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Send, CheckCircle, Wifi, WifiOff, XCircle, QrCode } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function MobileScannerPage() {
    const { toast } = useToast();

    const [peer, setPeer] = useState<Peer | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [lastImage, setLastImage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [peerId, setPeerId] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const getPeerIdFromHash = () => {
            if (typeof window !== 'undefined') {
                const hash = window.location.hash.substring(1);
                if (hash) {
                    setPeerId(hash);
                }
            }
        };

        getPeerIdFromHash();
        window.addEventListener('hashchange', getPeerIdFromHash);
        return () => window.removeEventListener('hashchange', getPeerIdFromHash);
    }, []);

    useEffect(() => {
        if (!peerId) return;

        let peerInstance: Peer | null = null;
        let connection: DataConnection | null = null;
        
        const initializePeer = async () => {
            try {
                const { default: Peer } = await import('peerjs');
                peerInstance = new Peer();
                setPeer(peerInstance);
                setConnectionStatus('connecting');

                peerInstance.on('open', (id) => {
                    connection = peerInstance!.connect(peerId);
                    setConn(connection);
                    
                    connection.on('open', () => {
                        setConnectionStatus('connected');
                        toast({ title: 'Desktop Connected!', description: 'You can now start scanning.' });
                    });
                    
                    connection.on('close', () => {
                        setConnectionStatus('disconnected');
                        toast({ variant: 'destructive', title: 'Desktop Disconnected' });
                        setConn(null);
                    });
                });

                peerInstance.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    setConnectionStatus('error');
                    toast({ variant: 'destructive', title: 'Connection Error' });
                });

            } catch (error) {
                console.error('Failed to initialize PeerJS', error);
                setConnectionStatus('error');
            }
        };

        initializePeer();

        return () => {
            connection?.close();
            peerInstance?.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [peerId]);

    useEffect(() => {
        if (connectionStatus !== 'connected') return;

        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
    
        getCameraPermission();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [connectionStatus]);
    
    const takePicture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && hasCameraPermission) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/png');
                setLastImage(dataUrl);
            }
        }
    }, [hasCameraPermission]);

    const sendImage = useCallback(() => {
        if (conn && lastImage && conn.open) {
            setIsSending(true);
            conn.send({ type: 'image', payload: lastImage });
            setTimeout(() => {
                setLastImage(null);
                setIsSending(false);
                toast({
                    title: "Image Sent!",
                    description: "It should now appear on your desktop.",
                });
            }, 500);
        } else {
             toast({ variant: 'destructive', title: 'Cannot send image', description: 'No active connection.' });
        }
    }, [conn, lastImage, toast]);

    const renderConnectionStatus = () => {
        switch (connectionStatus) {
            case 'connecting': return <><Loader2 className="h-4 w-4 animate-spin" />Connecting to Desktop...</>;
            case 'connected': return <><Wifi className="h-4 w-4 text-green-500"/>Connected to Desktop</>;
            case 'disconnected': return <><WifiOff className="h-4 w-4 text-red-500" />Disconnected</>;
            case 'error': return <><XCircle className="h-4 w-4 text-red-500"/>Connection Failed</>;
        }
    }
    
    if (!peerId) {
        return (
            <div className="flex flex-col h-screen bg-zinc-900 text-white p-4 items-center justify-center text-center">
                <QrCode className="w-16 h-16 text-primary mb-4"/>
                <h1 className="text-2xl font-bold mb-2">Scan QR Code from Desktop</h1>
                <p className="text-zinc-400 mb-6 max-w-sm">Please navigate to the "Scan to PDF" page on your computer and scan the QR code displayed there with your phone's camera.</p>
            </div>
        )
    }

    if (connectionStatus !== 'connected') {
         return (
            <div className="flex flex-col h-screen bg-zinc-900 text-white p-4 items-center justify-center text-center">
                 <header className="absolute top-4 p-4 bg-zinc-800/80 backdrop-blur-sm rounded-lg text-sm font-medium z-10 flex items-center justify-center gap-2">
                    {renderConnectionStatus()}
                </header>
                <div className="flex items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary"/>
                </div>
            </div>
        )
    }


    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <header className="p-4 bg-zinc-900/80 backdrop-blur-sm text-center text-sm font-medium z-10 flex items-center justify-center gap-2">
                {renderConnectionStatus()}
            </header>
            
            <main className="flex-1 relative flex flex-col items-center justify-center bg-black">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 <canvas ref={canvasRef} className="hidden" />

                 {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <Alert variant="destructive" className="max-w-sm">
                            <Camera className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings to use the scanner.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                 {lastImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-20 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lastImage} alt="Scanned preview" className="max-w-full max-h-[70vh] object-contain rounded-lg border-2 border-primary" />
                        
                        <div className="flex gap-4 mt-8">
                            <Button variant="outline" size="lg" onClick={() => setLastImage(null)} disabled={isSending}>
                                <Camera className="mr-2 h-5 w-5"/>
                                Retake
                            </Button>
                            <Button size="lg" onClick={sendImage} disabled={isSending}>
                                {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Send className="mr-2 h-5 w-5"/>}
                                {isSending ? 'Sending...' : 'Send to Desktop'}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                <Button 
                    className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-zinc-500 focus:border-primary"
                    onClick={takePicture}
                    disabled={connectionStatus !== 'connected' || hasCameraPermission !== true}
                    aria-label="Take Picture"
                >
                    <Camera className="h-8 w-8" />
                </Button>
            </footer>
        </div>
    );
}
