
'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: { [key: string]: unknown }[];
    }
}

interface AdSenseAdProps {
    slot: string;
    className?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ slot, className }) => {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const adPushedRef = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        const adContainer = adContainerRef.current;
        if (!adContainer) return;
        
        // This logic ensures that even with Fast Refresh, we get a clean slate.
        adContainer.innerHTML = ''; // Clear previous ad content on re-render

        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', 'ca-pub-3673219463234072');
        ins.setAttribute('data-ad-slot', slot);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        
        adContainer.appendChild(ins);
        
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }

    }, [slot]); // Rerun effect if the slot prop changes

    if (process.env.NODE_ENV !== 'production') {
        return (
            <div className="w-full h-full text-center bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Advertisement
            </div>
        );
    }
    
    // The ref is attached to this div, which will contain the ad.
    return <div ref={adContainerRef} className={className} />;
};

export default AdSenseAd;
