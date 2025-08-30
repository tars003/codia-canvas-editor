import React from 'react';
import { SelectedElement, ElementStyle } from '../types';

interface ToolbarProps {
    onLoadSample: () => void;
    onPasteJson: () => void;
    onAddText: () => void;
    onAddImage: () => void;
    onExport: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onStyleChange: (style: Partial<ElementStyle>) => void;
    selectedElements: SelectedElement[];
    hasElements: boolean;
    zoom: number;
    onZoomChange: (newZoom: number) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

const Button: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
    <button
        className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        {...props}
    >
        {children}
    </button>
);

const ToolbarIcon: React.FC<{ icon: React.ReactNode; isActive?: boolean; disabled?: boolean; onClick?: () => void; title: string }> = ({ icon, isActive, disabled, onClick, title }) => (
    <button onClick={onClick} disabled={disabled} title={title} className={`p-2 w-9 h-9 flex items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-sky-500 text-white' : 'hover:bg-slate-600'}`}>
        {icon}
    </button>
);


export const Toolbar: React.FC<ToolbarProps> = ({
    onLoadSample,
    onPasteJson,
    onAddText,
    onAddImage,
    onExport,
    onDelete,
    onDuplicate,
    onStyleChange,
    selectedElements,
    hasElements,
    zoom,
    onZoomChange,
}) => {
    const isSelectionActive = selectedElements.length > 0;
    const isSingleSelection = selectedElements.length === 1;
    const isTextSelected = isSelectionActive && selectedElements.every(el => el.type === 'Text');
    
    // Get styles from the first selected element to display in the toolbar
    const primaryStyle: Partial<ElementStyle> = isSelectionActive ? selectedElements[0].style : {};

    const handleStyleChange = <K extends keyof ElementStyle,>(prop: K, value: ElementStyle[K]) => {
        onStyleChange({ [prop]: value });
    };

    const toggleBold = () => {
        const isBold = primaryStyle.fontWeight === '700' || primaryStyle.fontWeight === 'bold';
        handleStyleChange('fontWeight', isBold ? '400' : '700');
    };

    const toggleItalic = () => {
        const isItalic = primaryStyle.fontStyle === 'italic';
        handleStyleChange('fontStyle', isItalic ? 'normal' : 'italic');
    };

    const toggleUnderline = () => {
        const currentDecoration = primaryStyle.textDecoration || '';
        let newDecoration = currentDecoration;
        if (currentDecoration.includes('underline')) {
            newDecoration = newDecoration.replace('underline', '').trim();
        } else {
            newDecoration = `${newDecoration} underline`.trim();
        }
        handleStyleChange('textDecoration', newDecoration);
    };
    
    const toggleLineThrough = () => {
        const currentDecoration = primaryStyle.textDecoration || '';
        let newDecoration = currentDecoration;
        if (currentDecoration.includes('line-through')) {
            newDecoration = newDecoration.replace('line-through', '').trim();
        } else {
            newDecoration = `${newDecoration} line-through`.trim();
        }
        handleStyleChange('textDecoration', newDecoration);
    };

    const transparentBg = 'transparent';
    const handleBgColorChange = (color: string) => {
        handleStyleChange('backgroundColor', color === '#000000' ? transparentBg : color);
    };

    const handleZoomOut = () => {
        onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP));
    };

    const handleZoomIn = () => {
        onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP));
    };


    return (
        <header className="bg-slate-800 text-white p-3 shadow-md z-10">
            <div className="container mx-auto flex items-center justify-between flex-wrap gap-y-3 gap-x-4">
                <h1 className="text-xl font-bold text-white whitespace-nowrap">Codia Text Editor</h1>

                <div className="flex items-center gap-2">
                    <Button onClick={onLoadSample}>Load Sample</Button>
                    <Button onClick={onPasteJson}>Paste JSON</Button>
                    <Button onClick={onAddText}>Add Text</Button>
                    <Button onClick={onAddImage}>Add Image</Button>
                    <Button onClick={onExport} disabled={!hasElements}>Export</Button>
                </div>

                {/* Text Formatting Group */}
                <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-md">
                     <select
                        id="fontFamily"
                        value={primaryStyle.fontFamily?.split(',')[0].replace(/"/g, '') || 'Inter'}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                        disabled={!isTextSelected}
                        title="Font Family"
                        className="bg-slate-600 text-white text-sm rounded-md p-2 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                    >
                        <option>Inter</option>
                        <option>Montserrat</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="DM Serif Text">DM Serif Text</option>
                        <option>Ibarra Real Nova</option>
                        <option>Caveat</option>
                        <option>Arial</option>
                    </select>
                     <input
                        type="number"
                        id="fontSize"
                        value={primaryStyle.fontSize || 16}
                        onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10))}
                        disabled={!isTextSelected}
                        title="Font Size"
                        className="w-16 bg-slate-600 text-white text-sm rounded-md p-2 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                    />
                    <input
                        type="color"
                        id="textColor"
                        value={primaryStyle.fill || '#000000'}
                        onChange={(e) => handleStyleChange('fill', e.target.value)}
                        disabled={!isTextSelected}
                        title="Text Color"
                        className="w-10 h-10 p-1 bg-slate-600 rounded-md border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                        type="color"
                        id="bgColor"
                        value={primaryStyle.backgroundColor === transparentBg ? '#000000' : primaryStyle.backgroundColor || '#ffffff'}
                        onChange={(e) => handleBgColorChange(e.target.value)}
                        disabled={!isTextSelected}
                        title="Background Color"
                        className="w-10 h-10 p-1 bg-slate-600 rounded-md border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
                    <ToolbarIcon title="Bold" icon={<span className="font-bold">B</span>} onClick={toggleBold} isActive={primaryStyle.fontWeight === '700' || primaryStyle.fontWeight === 'bold'} disabled={!isTextSelected}/>
                    <ToolbarIcon title="Italic" icon={<span className="italic">I</span>} onClick={toggleItalic} isActive={primaryStyle.fontStyle === 'italic'} disabled={!isTextSelected}/>
                    <ToolbarIcon title="Underline" icon={<span className="underline">U</span>} onClick={toggleUnderline} isActive={primaryStyle.textDecoration?.includes('underline')} disabled={!isTextSelected}/>
                    <ToolbarIcon title="Strikethrough" icon={<span className="line-through">S</span>} onClick={toggleLineThrough} isActive={primaryStyle.textDecoration?.includes('line-through')} disabled={!isTextSelected}/>
                </div>
                 <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
                    <ToolbarIcon title="Align Left" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>} onClick={() => handleStyleChange('align', 'left')} isActive={primaryStyle.align === 'left'} disabled={!isTextSelected}/>
                    <ToolbarIcon title="Align Center" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>} onClick={() => handleStyleChange('align', 'center')} isActive={primaryStyle.align === 'center'} disabled={!isTextSelected}/>
                    <ToolbarIcon title="Align Right" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 9a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>} onClick={() => handleStyleChange('align', 'right')} isActive={primaryStyle.align === 'right'} disabled={!isTextSelected}/>
                </div>
                
                {/* Element Properties Group */}
                <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-md">
                    <label htmlFor="opacity" className="text-sm pl-2">Opacity</label>
                    <input
                        type="range"
                        id="opacity"
                        min="0" max="100"
                        value={Math.round((primaryStyle.opacity ?? 1) * 100)}
                        onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value, 10) / 100)}
                        disabled={!isSelectionActive}
                        title="Opacity"
                        className="w-24 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <label htmlFor="rotation" className="text-sm pl-2">Rotate</label>
                     <input
                        type="number"
                        id="rotation"
                        value={Math.round(primaryStyle.rotation || 0)}
                        onChange={(e) => handleStyleChange('rotation', parseInt(e.target.value, 10))}
                        disabled={!isSingleSelection}
                        title="Rotation"
                        className="w-16 bg-slate-600 text-white text-sm rounded-md p-2 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
                        <ToolbarIcon title="Zoom Out" disabled={!hasElements} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>} onClick={handleZoomOut} />
                        <span className="text-sm font-medium w-16 text-center tabular-nums" aria-live="polite">{Math.round(zoom * 100)}%</span>
                        <ToolbarIcon title="Zoom In" disabled={!hasElements} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>} onClick={handleZoomIn} />
                    </div>
                    <Button onClick={onDelete} disabled={!isSelectionActive}>Delete</Button>
                    <Button onClick={onDuplicate} disabled={!isSelectionActive}>Duplicate</Button>
                </div>
            </div>
        </header>
    );
};