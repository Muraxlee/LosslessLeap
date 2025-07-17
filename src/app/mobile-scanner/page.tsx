
'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Peer, DataConnection } from 'peerjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Send, CheckCircle, Wifi, WifiOff, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function MobileScannerPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [peer, setPeer] = useState<Peer | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('connecting');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [lastImage, setLastImage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const initializePeer = async () => {
            const peerId = searchParams.get('peerId');
            if (!peerId) {
                setConnectionStatus('error');
                toast({ variant: 'destructive', title: 'Missing Peer ID' });
                return;
            }

            try {
                const { default: Peer } = await import('peerjs');
                const localPeer = new Peer(); // Create a peer with a random ID
                setPeer(localPeer);

                localPeer.on('open', (id) => {
                    const connection = localPeer.connect(peerId);
                    setConn(connection);

                    connection.on('open', () => {
                        setConnectionStatus('connected');
                    });

                    connection.on('error', (err) => {
                        console.error('Connection error:', err);
                        setConnectionStatus('error');
                    });
                     connection.on('close', () => {
                        setConnectionStatus('disconnected');
                    });
                });
                 localPeer.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    setConnectionStatus('error');
                });

            } catch (error) {
                console.error("Failed to initialize PeerJS", error);
                setConnectionStatus('error');
            }
        };

        initializePeer();

        return () => {
            conn?.close();
            peer?.destroy();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
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
          }
        };
    
        getCameraPermission();
      }, []);
    
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
            case 'connecting': return <><Loader2 className="h-4 w-4 animate-spin" />Connecting...</>;
            case 'connected': return <><Wifi className="h-4 w-4 text-green-500"/>Connected to Desktop</>;
            case 'disconnected': return <><WifiOff className="h-4 w-4 text-red-500" />Disconnected</>;
            case 'error': return <><XCircle className="h-4 w-4 text-red-500"/>Connection Failed</>;
        }
    }

    if(hasCameraPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                 <Alert variant="destructive">
                      <Camera className="h-4 w-4" />
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser settings to use the scanner.
                      </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <header className="p-4 bg-zinc-900/80 backdrop-blur-sm text-center text-sm font-medium z-10 flex items-center justify-center gap-2">
                {renderConnectionStatus()}
            </header>
            
            <main className="flex-1 relative flex items-center justify-center">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 <canvas ref={canvasRef} className="hidden" />

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
                    disabled={connectionStatus !== 'connected'}
                    aria-label="Take Picture"
                >
                    <Camera className="h-8 w-8" />
                </Button>
            </footer>
        </div>
    );
}

