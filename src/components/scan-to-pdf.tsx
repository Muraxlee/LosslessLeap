
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';

const ScanIllustration = () => (
    <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
        <path d="M72.2348 75.0001C72.2348 88.7517 61.2132 99.7733 47.4616 99.7733C33.71 99.7733 22.6885 88.7517 22.6885 75.0001C22.6885 61.2484 33.71 50.2268 47.4616 50.2268C61.2132 50.2268 72.2348 61.2484 72.2348 75.0001Z" stroke="#94A3B8" strokeWidth="2"/>
        <path d="M47.4619 86.6666C54.0019 86.6666 59.3567 81.3118 59.3567 74.7718C59.3567 68.2318 54.0019 62.877 47.4619 62.877C40.9219 62.877 35.5671 68.2318 35.5671 74.7718C35.5671 81.3118 40.9219 86.6666 47.4619 86.6666Z" stroke="#94A3B8" strokeWidth="2"/>
        <mask id="mask0_803_2" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="79" y="50" width="100" height="50">
            <path d="M79.522 75L179.043 50.4782V100.478L79.522 75Z" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_803_2)">
            <path d="M79.522 75L179.043 50.4782V100.478L79.522 75Z" fill="#D1FAE5"/>
            <path d="M129.282 62.7391L79.5215 75L129.282 87.7391L179.043 100.478V50.4782L129.282 62.7391Z" fill="#A7F3D0"/>
        </g>
        <rect x="184.28" y="47" width="46.8511" height="90" rx="6" stroke="#94A3B8" strokeWidth="2"/>
        <path d="M189.232 54.2174H226.178" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M197.872 106.848C194.846 106.848 192.383 104.385 192.383 101.359V86.1957C192.383 83.17 194.846 80.7066 197.872 80.7066H215.148C218.174 80.7066 220.637 83.17 220.637 86.1957V101.359C220.637 104.385 218.174 106.848 215.148 106.848H197.872Z" stroke="#94A3B8" strokeWidth="2"/>
        <path d="M228.093 92.2174C231.259 87.0853 231.259 80.4147 228.093 75.2826" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);


export default function ScanToPdf() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real application, you would generate a unique session ID
    // and construct the URL to point to a mobile scanning page.
    const sessionId = 'mock-session-id-' + Math.random().toString(36).substring(2, 9);
    const url = `${window.location.origin}/mobile-scanner?session=${sessionId}`;

    QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 256,
        color: {
            dark: '#020817', // foreground
            light: '#00000000' // transparent
        }
    })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('QR Code generation failed:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    // Mock connection status change
    const connectTimeout = setTimeout(() => setIsConnected(true), 5000);
    return () => clearTimeout(connectTimeout);

  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <Card className="p-8 text-center">
            <h3 className="text-2xl font-semibold text-foreground">Step 1</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                Use your smartphone's camera to scan this QR code
            </p>
            <div className="relative aspect-square max-w-xs mx-auto flex items-center justify-center">
                {isLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
                {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="QR Code to scan" className="w-full h-full object-contain" />
                )}
            </div>
        </Card>
        
        <div className="p-8 text-center md:text-left">
            <h3 className="text-2xl font-semibold text-foreground opacity-50">Step 2</h3>
            <div className="mt-2 mb-6">
                <Badge variant={isConnected ? "default": "secondary"} className={isConnected ? "bg-green-100 text-green-800" : ""}>
                    {isConnected ? "Connected" : "Disconnected"}
                </Badge>
            </div>
            <p className="text-muted-foreground mb-6">
                To scan your documents, please follow the instructions on your mobile screen, and tap Save when you're done.
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