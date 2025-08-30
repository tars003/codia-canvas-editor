
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { JsonModal } from './components/JsonModal';
import { SAMPLE_CODIA_DATA } from './constants/sample-data';
import { CodiaData, CanvasElement, SelectedElement, ElementStyle } from './types';
import { parseCodiaData } from './utils/codiaParser';
import { CanvasFooter } from './components/CanvasFooter';

const App: React.FC = () => {
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
    const [isJsonModalOpen, setJsonModalOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 1024, height: 1024 });
    const [codiaData, setCodiaData] = useState<CodiaData | null>(null);
    const [zoom, setZoom] = useState(1.0);
    const mainContainerRef = useRef<HTMLElement>(null);


    useEffect(() => {
        // Preload fonts to avoid rendering issues with Konva
        document.fonts.ready.then(() => {
            console.log('Fonts loaded.');
        });
    }, []);

    const processData = useCallback((data: CodiaData) => {
        setCodiaData(data);
        const { baseWidth, baseHeight } = data.data.configuration;
        setCanvasSize({ width: baseWidth, height: baseHeight || baseWidth });
        const parsed = parseCodiaData(data.data.visualElement);
        setElements(parsed);
        setSelectedElements([]);

        if (mainContainerRef.current) {
            const padding = 80; // Add some visual padding
            const { width: containerWidth, height: containerHeight } = mainContainerRef.current.getBoundingClientRect();
            const scaleX = (containerWidth - padding) / baseWidth;
            const scaleY = (containerHeight - padding) / (baseHeight || baseWidth);
            setZoom(Math.min(scaleX, scaleY, 1.0)); // Fit to view, but don't scale up past 100% initially
        }

    }, []);
    
    const handleLoadSampleData = useCallback(() => {
        processData(SAMPLE_CODIA_DATA as CodiaData);
    }, [processData]);

    const handleLoadJson = useCallback((jsonString: string) => {
        try {
            const data = JSON.parse(jsonString) as CodiaData;
            // Basic validation
            if (!data?.data?.configuration || !data?.data?.visualElement) {
                throw new Error("Invalid Codia JSON structure.");
            }
            processData(data);
            setJsonModalOpen(false);
        } catch (error) {
            alert((error as Error).message);
        }
    }, [processData]);

    const handleUpdateElementStyle = useCallback((style: Partial<ElementStyle>) => {
        setElements(prevElements => {
            const selectedIds = new Set(selectedElements.map(el => el.id));
            return prevElements.map(el => {
                if (selectedIds.has(el.id) && el.type === 'Text') {
                    return { ...el, style: { ...el.style, ...style } };
                }
                return el;
            });
        });
         // Also update the selectedElements state to reflect style changes in toolbar
        setSelectedElements(prevSelected => {
            return prevSelected.map(sel => {
                if (sel.type === 'Text') {
                    return { ...sel, style: { ...sel.style, ...style } };
                }
                return sel;
            });
        });

    }, [selectedElements]);

    const handleDelete = useCallback(() => {
        const selectedIds = new Set(selectedElements.map(el => el.id));
        setElements(prev => prev.filter(el => !selectedIds.has(el.id)));
        setSelectedElements([]);
    }, [selectedElements]);

    const handleDuplicate = useCallback(() => {
        const selectedIds = new Set(selectedElements.map(el => el.id));
        const elementsToDuplicate = elements.filter(el => selectedIds.has(el.id));
        
        const newElements = elementsToDuplicate.map((el, index) => ({
            ...el,
            id: `${el.id}_copy_${Date.now()}_${index}`,
            x: el.x + 20,
            y: el.y + 20,
            zIndex: elements.length + index,
        }));

        setElements(prev => [...prev, ...newElements]);
        setSelectedElements(newElements.map(el => ({ id: el.id, type: el.type, style: el.style })));
    }, [elements, selectedElements]);

    const handleExport = useCallback(() => {
        if (!codiaData) return;

        const modifiedElementsData = elements.map(el => {
            return {
                id: el.id,
                type: el.type,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                ...el.style,
                text: el.type === 'Text' ? (el as any).text : undefined
            };
        });
        
        const exportData = {
            originalCodiaData: codiaData,
            modifiedElements: modifiedElementsData,
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'codia-text-editor-export.json');
        linkElement.click();
    }, [codiaData, elements]);
    
    const handleTextChange = useCallback((id: string, newText: string) => {
        setElements(prev => 
            prev.map(el => el.id === id && el.type === 'Text' ? { ...el, text: newText } : el)
        );
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Toolbar
                onLoadSample={handleLoadSampleData}
                onPasteJson={() => setJsonModalOpen(true)}
                onExport={handleExport}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onStyleChange={handleUpdateElementStyle}
                selectedElements={selectedElements}
                hasElements={elements.length > 0}
            />
            <main ref={mainContainerRef} className="flex-grow flex items-center justify-center p-4 bg-gray-200 relative overflow-hidden">
                {elements.length > 0 ? (
                    <>
                        <EditorCanvas
                            elements={elements}
                            onElementsChange={setElements}
                            selectedElements={selectedElements}
                            onSelectedElementsChange={setSelectedElements}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onTextChange={handleTextChange}
                            zoom={zoom}
                            onZoomChange={setZoom}
                        />
                        <CanvasFooter zoom={zoom} onZoomChange={setZoom} />
                    </>
                ) : (
                    <div className="text-center text-gray-500 bg-white p-20 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Welcome to the Codia Text Editor</h2>
                        <p>Click "Load Sample Data" or "Paste JSON Data" to begin editing.</p>
                    </div>
                )}
            </main>
            <JsonModal
                isOpen={isJsonModalOpen}
                onClose={() => setJsonModalOpen(false)}
                onSubmit={handleLoadJson}
            />
        </div>
    );
};

export default App;
