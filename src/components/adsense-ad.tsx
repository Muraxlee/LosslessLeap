
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
    const insRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        // Prevent script from running twice on the same ad slot
        if (insRef.current && insRef.current.children.length > 0) {
            return;
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error(err);
        }
    }, [slot]); // Re-run effect if slot changes

    if (process.env.NODE_ENV !== 'production') {
        return (
            <div className="w-full h-full text-center bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Advertisement
            </div>
        );
    }
    
    return (
        <ins
            ref={insRef}
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
