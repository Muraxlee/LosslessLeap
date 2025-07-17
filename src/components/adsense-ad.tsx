
'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: { [key: string]: unknown }[];
    }
}

interface AdSenseAdProps {
    slot: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ slot }) => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // Check if the ad has already been loaded
            if (adRef.current && adRef.current.getAttribute('data-ad-status') === 'filled') {
                return;
            }
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, [slot]); // Re-run if the slot changes, which is rare but good practice

    if (process.env.NODE_ENV !== 'production') {
        return (
            <div className="w-full h-full text-center bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Advertisement
            </div>
        );
    }
    
    return (
        <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3673219463234072"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    );
};

export default AdSenseAd;
