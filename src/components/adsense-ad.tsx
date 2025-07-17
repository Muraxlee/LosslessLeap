
'use client';

import { useEffect } from 'react';

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
            console.error(err);
        }
    }, []);

    if (process.env.NODE_ENV !== 'production') {
        return (
            <div className="w-full text-center bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
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
