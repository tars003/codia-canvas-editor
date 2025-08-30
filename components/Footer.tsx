import React from 'react';

interface FooterProps {
    zoom: number;
    onZoomChange: (newZoom: number) => void;
    hasElements: boolean;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;

export const Footer: React.FC<FooterProps> = ({ zoom, onZoomChange, hasElements }) => {
    if (!hasElements) return null;

    return (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 flex items-center p-2 gap-3">
                 <button 
                    onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - 0.1))} 
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                    aria-label="Zoom out"
                 >
                    -
                 </button>
                 <input 
                    type="range"
                    min={MIN_ZOOM * 100}
                    max={MAX_ZOOM * 100}
                    value={zoom * 100}
                    onChange={(e) => onZoomChange(parseFloat(e.target.value) / 100)}
                    className="w-40 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                <span className="text-sm font-medium w-12 text-center tabular-nums" aria-live="polite">
                    {Math.round(zoom * 100)}%
                </span>
                 <button 
                    onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + 0.1))} 
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                    aria-label="Zoom in"
                >
                    +
                </button>
            </div>
        </div>
    );
};
