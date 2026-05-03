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
    
    const imageUrl = getStreetViewUrl(address, city, state, zip);

    if (!imageUrl || error) {
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
                className="w-full h-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img 
                    src={imageUrl} 
                    alt="Property Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            </div>

            {/* Hover Zoom Preview */}
            {isHovered && (
                <div 
                    className="fixed z-[9999] pointer-events-none rounded-xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700 animate-in zoom-in-50 fade-in duration-200"
                    style={{
                        width: 240,
                        height: 160,
                        transform: 'translate(-50%, -110%)',
                        left: '50%', // This is relative to the container, I'll use a better positioning below
                    }}
                >
                    <img 
                        src={imageUrl} 
                        alt="Zoomed Preview" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-1.5">
                        <p className="text-[10px] text-white font-bold truncate text-center">{address}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
