import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { JsonModal } from './components/JsonModal';
import { SAMPLE_CODIA_DATA } from './constants/sample-data';
import { CodiaData, CanvasElement, SelectedElement, ElementStyle } from './types';
import { parseCodiaData } from './utils/codiaParser';

const App: React.FC = () => {
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
    const [isJsonModalOpen, setJsonModalOpen] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 1024, height: 1024 });
    const [codiaData, setCodiaData] = useState<CodiaData | null>(null);
    const [zoom, setZoom] = useState(1.0);
    const mainContainerRef = useRef<HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        // Preload fonts to avoid rendering issues with Konva
        document.fonts.ready.then(() => {
            console.log('Fonts loaded.');
        });
    }, []);

    // FIX: Add state setters to dependency array to be explicit, even though they are stable.
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

    }, [setCanvasSize, setCodiaData, setElements, setSelectedElements, setZoom]);
    
    const handleLoadSampleData = useCallback(() => {
        processData(SAMPLE_CODIA_DATA as CodiaData);
    }, [processData]);

    // FIX: Add `setJsonModalOpen` to dependency array.
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
    }, [processData, setJsonModalOpen]);

    // FIX: Add `setElements` and `setSelectedElements` to dependency array.
    const handleUpdateElementStyle = useCallback((style: Partial<ElementStyle>) => {
        setSelectedElements(prevSelected => {
            const selectedIds = new Set(prevSelected.map(el => el.id));
            
            if (selectedIds.size > 0) {
                setElements(prevElements =>
                    prevElements.map(el => {
                        if (selectedIds.has(el.id)) {
                            return { ...el, style: { ...el.style, ...style } };
                        }
                        return el;
                    })
                );
            }
            
            // Return the new state for selectedElements to update the toolbar
            return prevSelected.map(sel => ({
                ...sel,
                style: { ...sel.style, ...style },
            }));
        });
    }, [setElements, setSelectedElements]);


    // FIX: Add `setElements` and `setSelectedElements` to dependency array.
    const handleDelete = useCallback(() => {
        const selectedIds = new Set(selectedElements.map(el => el.id));
        setElements(prev => prev.filter(el => !selectedIds.has(el.id)));
        setSelectedElements([]);
    }, [selectedElements, setElements, setSelectedElements]);

    // FIX: Add `setElements` and `setSelectedElements` to dependency array.
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
    }, [elements, selectedElements, setElements, setSelectedElements]);

    // FIX: Add `setElements` and `setSelectedElements` to dependency array and use `canvasSize` object.
    const handleAddText = useCallback(() => {
        const newTextElement: CanvasElement = {
            id: `text_${Date.now()}`,
            type: 'Text',
            x: canvasSize.width / 2 - 150,
            y: canvasSize.height / 2 - 25,
            width: 300,
            height: 50,
            draggable: true,
            zIndex: elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) + 1 : 1,
            text: 'Type something...',
            style: {
                fill: '#333333',
                opacity: 1,
                fontFamily: 'Inter',
                fontSize: 40,
                fontStyle: 'normal',
                fontWeight: 'normal',
                align: 'center',
                backgroundColor: 'transparent',
                rotation: 0,
            },
            originalData: {} as any, // This is a new element, no original data
        };
        setElements(prev => [...prev, newTextElement]);
        setSelectedElements([{ id: newTextElement.id, type: newTextElement.type, style: newTextElement.style }]);
    }, [canvasSize, elements, setElements, setSelectedElements]);

    const handleAddImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const MAX_DIMENSION = 400;
                let width = img.width;
                let height = img.height;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = (height / width) * MAX_DIMENSION;
                        width = MAX_DIMENSION;
                    } else {
                        width = (width / height) * MAX_DIMENSION;
                        height = MAX_DIMENSION;
                    }
                }

                const newImageElement: CanvasElement = {
                    id: `image_${Date.now()}`,
                    type: 'Image',
                    x: canvasSize.width / 2 - width / 2,
                    y: canvasSize.height / 2 - height / 2,
                    width,
                    height,
                    draggable: true,
                    zIndex: elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) + 1 : 1,
                    imageUrl: imageUrl,
                    style: {
                        opacity: 1,
                        rotation: 0,
                    },
                    originalData: {} as any,
                };

                setElements(prev => [...prev, newImageElement]);
                setSelectedElements([{ id: newImageElement.id, type: newImageElement.type, style: newImageElement.style }]);
            };
            img.src = imageUrl;
        };
        reader.readAsDataURL(file);

        // Reset file input value to allow selecting the same file again
        e.target.value = '';
    }, [canvasSize, elements, setElements, setSelectedElements]);

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
    
    // FIX: Add `setElements` to dependency array.
    const handleTextChange = useCallback((id: string, newText: string) => {
        setElements(prev => 
            prev.map(el => el.id === id && el.type === 'Text' ? { ...el, text: newText } : el)
        );
    }, [setElements]);

    return (
        <div className="min-h-screen flex flex-col font-sans">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/gif"
            />
            <Toolbar
                onLoadSample={handleLoadSampleData}
                onPasteJson={() => setJsonModalOpen(true)}
                onAddText={handleAddText}
                onAddImage={handleAddImage}
                onExport={handleExport}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onStyleChange={handleUpdateElementStyle}
                selectedElements={selectedElements}
                hasElements={elements.length > 0}
                zoom={zoom}
                onZoomChange={setZoom}
            />
            <main ref={mainContainerRef} className="flex-grow flex items-center justify-center p-4 bg-gray-200 relative overflow-hidden">
                {elements.length > 0 ? (
                    <EditorCanvas
                        elements={elements}
                        onElementsChange={setElements}
                        selectedElements={selectedElements}
                        onSelectedElementsChange={setSelectedElements}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onTextChange={handleTextChange}
                        zoom={zoom}
                    />
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