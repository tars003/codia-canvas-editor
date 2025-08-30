import React from 'react';
import { SelectedElement, ElementStyle } from '../types';

interface PropertiesPanelProps {
    selectedElements: SelectedElement[];
    onStyleChange: (style: Partial<ElementStyle>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const PanelSection: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
    <div className="border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 px-4 py-2 bg-gray-50">{title}</h3>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

const StyleInput: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600">{label}</label>
        {children}
    </div>
);

const IconButton: React.FC<React.PropsWithChildren<{ title: string; isActive?: boolean; onClick?: () => void; }>> = ({ title, isActive, onClick, children }) => (
    <button
        title={title}
        onClick={onClick}
        className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
    >
        {children}
    </button>
);


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElements, onStyleChange, onDelete, onDuplicate }) => {
    const isSelectionActive = selectedElements.length > 0;
    const isSingleSelection = selectedElements.length === 1;
    const isTextSelected = isSelectionActive && selectedElements.every(el => el.type === 'Text');
    
    const primaryStyle: Partial<ElementStyle> = isSelectionActive ? selectedElements[0].style : {};

    const handleStyleChange = <K extends keyof ElementStyle,>(prop: K, value: ElementStyle[K]) => {
        onStyleChange({ [prop]: value });
    };

    if (!isSelectionActive) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>Select an element on the canvas to see its properties.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full">
            {isTextSelected && (
                <PanelSection title="Text">
                    <StyleInput label="Font">
                         <select
                            value={primaryStyle.fontFamily?.split(',')[0].replace(/"/g, '') || 'Inter'}
                            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                            className="w-40 bg-white border border-gray-300 text-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Inter</option>
                            <option>Montserrat</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="DM Serif Text">DM Serif Text</option>
                            <option>Ibarra Real Nova</option>
                            <option>Caveat</option>
                            <option>Arial</option>
                        </select>
                    </StyleInput>
                     <StyleInput label="Size">
                         <input
                            type="number"
                            value={primaryStyle.fontSize || 16}
                            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10))}
                            className="w-20 bg-white border border-gray-300 text-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </StyleInput>
                    <StyleInput label="Style">
                        <div className="flex items-center gap-2">
                             <IconButton title="Bold" isActive={primaryStyle.fontWeight === '700' || primaryStyle.fontWeight === 'bold'} onClick={() => handleStyleChange('fontWeight', (primaryStyle.fontWeight === '700' || primaryStyle.fontWeight === 'bold') ? '400' : '700')}>
                                <span className="font-bold">B</span>
                            </IconButton>
                             <IconButton title="Italic" isActive={primaryStyle.fontStyle === 'italic'} onClick={() => handleStyleChange('fontStyle', primaryStyle.fontStyle === 'italic' ? 'normal' : 'italic')}>
                                <span className="italic">I</span>
                            </IconButton>
                        </div>
                    </StyleInput>
                    <StyleInput label="Align">
                        <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-md">
                            <button onClick={() => handleStyleChange('align', 'left')} className={`p-1.5 rounded ${primaryStyle.align === 'left' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                            <button onClick={() => handleStyleChange('align', 'center')} className={`p-1.5 rounded ${primaryStyle.align === 'center' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                            <button onClick={() => handleStyleChange('align', 'right')} className={`p-1.5 rounded ${primaryStyle.align === 'right' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 9a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                    </StyleInput>
                     <StyleInput label="Color">
                        <div className="relative w-8 h-8 rounded border border-gray-300 overflow-hidden">
                           <input
                                type="color"
                                value={primaryStyle.fill || '#000000'}
                                onChange={(e) => handleStyleChange('fill', e.target.value)}
                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                            />
                        </div>
                    </StyleInput>
                </PanelSection>
            )}

            <PanelSection title="Style">
                <StyleInput label="Opacity">
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="0" max="100"
                            value={Math.round((primaryStyle.opacity ?? 1) * 100)}
                            onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value, 10) / 100)}
                            className="w-28 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm w-10 text-right">{Math.round((primaryStyle.opacity ?? 1) * 100)}%</span>
                    </div>
                </StyleInput>

                 <StyleInput label="Rotation">
                     <div className="flex items-center gap-2">
                         <input
                            type="number"
                            value={Math.round(primaryStyle.rotation || 0)}
                            onChange={(e) => handleStyleChange('rotation', parseInt(e.target.value, 10))}
                            disabled={!isSingleSelection}
                            className="w-20 bg-white border border-gray-300 text-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span>°</span>
                     </div>
                </StyleInput>
            </PanelSection>
            
            <PanelSection title="Arrange">
                 <div className="grid grid-cols-2 gap-2">
                     <button onClick={onDuplicate} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Duplicate</button>
                     <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">Delete</button>
                 </div>
            </PanelSection>
        </div>
    );
};
