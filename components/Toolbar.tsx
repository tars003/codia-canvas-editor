import React from 'react';
import { SelectedElement, ElementStyle } from '../types';

interface ToolbarProps {
    onLoadSample: () => void;
    onPasteJson: () => void;
    onExport: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onStyleChange: (style: Partial<ElementStyle>) => void;
    selectedElements: SelectedElement[];
    hasElements: boolean;
}

const Button: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
    <button
        className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        {...props}
    >
        {children}
    </button>
);

const ToolbarIcon: React.FC<{ icon: string; isActive?: boolean; onClick?: () => void; }> = ({ icon, isActive, onClick }) => (
    <button onClick={onClick} className={`p-2 rounded-md ${isActive ? 'bg-sky-500 text-white' : 'hover:bg-slate-600'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={icon} clipRule="evenodd" />
        </svg>
    </button>
);


export const Toolbar: React.FC<ToolbarProps> = ({
    onLoadSample,
    onPasteJson,
    onExport,
    onDelete,
    onDuplicate,
    onStyleChange,
    selectedElements,
    hasElements,
}) => {
    const isSelectionActive = selectedElements.length > 0;
    const isSingleTextSelected = selectedElements.length === 1 && selectedElements[0].type === 'Text';
    // FIX: Explicitly type `singleTextStyle` to prevent type errors when no element is selected.
    const singleTextStyle: Partial<ElementStyle> = isSingleTextSelected ? selectedElements[0].style : {};

    const handleStyleChange = <K extends keyof ElementStyle,>(prop: K, value: ElementStyle[K]) => {
        onStyleChange({ [prop]: value });
    };

    const toggleFontStyle = (style: 'bold' | 'italic') => {
        const currentStyle = singleTextStyle.fontStyle || 'normal';
        let newStyle;
        if (style === 'bold') {
            newStyle = currentStyle.includes('bold') ? currentStyle.replace('bold', '').trim() : `bold ${currentStyle}`.trim();
        } else { // italic
            newStyle = currentStyle.includes('italic') ? currentStyle.replace('italic', '').trim() : `italic ${currentStyle}`.trim();
        }
        if (newStyle === '') newStyle = 'normal';
        onStyleChange({ fontStyle: newStyle });
    };

    return (
        <header className="bg-slate-800 text-white p-3 shadow-md z-10">
            <div className="container mx-auto flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-xl font-bold text-white whitespace-nowrap">Codia Text Editor</h1>

                <div className="flex items-center gap-2">
                    <Button onClick={onLoadSample}>Load Sample</Button>
                    <Button onClick={onPasteJson}>Paste JSON</Button>
                    <Button onClick={onExport} disabled={!hasElements}>Export</Button>
                </div>

                <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-md">
                     <select
                        id="fontFamily"
                        value={singleTextStyle.fontFamily || 'Inter'}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                        disabled={!isSingleTextSelected}
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
                        value={singleTextStyle.fontSize || 16}
                        onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10))}
                        disabled={!isSingleTextSelected}
                        className="w-20 bg-slate-600 text-white text-sm rounded-md p-2 border-transparent focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                    />
                    <input
                        type="color"
                        id="textColor"
                        value={singleTextStyle.fill || '#000000'}
                        onChange={(e) => handleStyleChange('fill', e.target.value)}
                        disabled={!isSingleTextSelected}
                        className="w-10 h-10 p-1 bg-slate-600 rounded-md border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
                    <ToolbarIcon icon="M10 4.5a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5a.75.75 0 01.75-.75zM10 12a1 1 0 100 2h.01a1 1 0 100-2H10z" onClick={() => toggleFontStyle('bold')} isActive={singleTextStyle.fontStyle?.includes('bold')} />
                    <ToolbarIcon icon="M8.5 5.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0V5.5zM10 5.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM11.5 14.5a.75.75 0 001.5 0v-2.5a.75.75 0 00-1.5 0v2.5zM10 14.5a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75z" onClick={() => toggleFontStyle('italic')} isActive={singleTextStyle.fontStyle?.includes('italic')} />
                </div>
                 <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-md">
                    <ToolbarIcon icon="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.75zM3 9.75A.75.75 0 013.75 9h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zM3.75 14a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" onClick={() => handleStyleChange('align', 'left')} isActive={singleTextStyle.align === 'left'} />
                    <ToolbarIcon icon="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.75zM6.75 9a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zM3.75 14a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" onClick={() => handleStyleChange('align', 'center')} isActive={singleTextStyle.align === 'center'}/>
                    <ToolbarIcon icon="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.75zM3 9.75A.75.75 0 013.75 9h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zM3.75 14a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" onClick={() => handleStyleChange('align', 'right')} isActive={singleTextStyle.align === 'right'}/>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button onClick={onDelete} disabled={!isSelectionActive}>Delete</Button>
                    <Button onClick={onDuplicate} disabled={!isSelectionActive}>Duplicate</Button>
                </div>
            </div>
        </header>
    );
};