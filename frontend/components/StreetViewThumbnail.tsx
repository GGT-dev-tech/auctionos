import React, { useState } from 'react';
import { getStreetViewUrl } from '../utils/maps';

interface StreetViewThumbnailProps {
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    size?: number;
}

export const StreetViewThumbnail: React.FC<StreetViewThumbnailProps> = ({ 
    address, 
    city, 
    state, 
    zip, 
    size = 48 
}) => {
    const [error, setError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    // Robust address extraction and sanitization
    const effectiveAddress = address || "";
    const imageUrl = getStreetViewUrl(effectiveAddress, city, state, zip);

    // Diagnostics for debugging in production
    useEffect(() => {
        if (!imageUrl && effectiveAddress) {
            console.warn(`StreetViewThumbnail: Failed to generate URL for "${effectiveAddress}"`);
        }
    }, [imageUrl, effectiveAddress]);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (!imageUrl || error || !effectiveAddress || effectiveAddress.length < 3) {
        return (
            <div 
                className="bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"
                style={{ width: size, height: size }}
            >
                <span className="material-symbols-outlined text-slate-400 text-lg">image_not_supported</span>
            </div>
        );
    }

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            {/* Main Thumbnail */}
            <div 
                className="w-full h-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110 cursor-zoom-in active:scale-95"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                <img 
                    src={imageUrl} 
                    alt="Property Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                    loading="lazy"
                />
            </div>

            {/* Hover Zoom Preview - Portaled to avoid clipping */}
            {isHovered && (
                <div 
                    className="fixed z-[99999] pointer-events-none rounded-xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700 animate-in zoom-in-75 fade-in duration-150"
                    style={{
                        width: 320,
                        height: 200,
                        top: mousePos.y - 220,
                        left: mousePos.x - 160,
                    }}
                >
                    <img 
                        src={imageUrl} 
                        alt="Zoomed Preview" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-2">
                        <p className="text-[10px] text-white font-black truncate text-center uppercase tracking-tighter">
                            {effectiveAddress}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
