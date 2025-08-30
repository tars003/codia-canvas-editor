
import React from 'react';

interface CanvasFooterProps {
    zoom: number;
    onZoomChange: (newZoom: number) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

export const CanvasFooter: React.FC<CanvasFooterProps> = ({ zoom, onZoomChange }) => {
    const handleZoomOut = () => {
        onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP));
    };

    const handleZoomIn = () => {
        onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP));
    };

    return (
        <div className="absolute bottom-4 right-4 bg-slate-800 text-white rounded-lg shadow-lg flex items-center p-1 gap-2 z-10">
            <button onClick={handleZoomOut} className="px-3 py-1 rounded hover:bg-slate-600 transition-colors" aria-label="Zoom out">-</button>
            <span className="text-sm font-medium w-16 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="px-3 py-1 rounded hover:bg-slate-600 transition-colors" aria-label="Zoom in">+</button>
        </div>
    );
};
