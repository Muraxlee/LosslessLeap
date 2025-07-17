
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
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            if (err instanceof Error) {
                // AdSense throws a "TagError" if an ad is pushed to a slot that already has an ad.
                // This is common in dev mode with Next.js hot-reloading. We can safely ignore it.
                if (!err.message.includes('TagError')) {
                   console.error('AdSense error:', err);
                }
            } else {
                console.error('AdSense error:', err);
            }
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
