
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Konva from 'konva';
import { CanvasElement, SelectedElement } from '../types';

interface EditorCanvasProps {
    elements: CanvasElement[];
    onElementsChange: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
    selectedElements: SelectedElement[];
    onSelectedElementsChange: React.Dispatch<React.SetStateAction<SelectedElement[]>>;
    width: number;
    height: number;
    onTextChange: (id: string, newText: string) => void;
    zoom: number;
    onZoomChange: (newZoom: number) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    elements,
    onElementsChange,
    selectedElements,
    onSelectedElementsChange,
    width,
    height,
    onTextChange,
    zoom,
    onZoomChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const layerRef = useRef<Konva.Layer | null>(null);
    const trRef = useRef<Konva.Transformer | null>(null);
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const [editingTextNode, setEditingTextNode] = useState<Konva.Text | null>(null);

    // Initialize Stage
    useEffect(() => {
        if (!containerRef.current) return;
        
        stageRef.current = new Konva.Stage({
            container: containerRef.current,
            width: width,
            height: height,
            draggable: true,
        });

        layerRef.current = new Konva.Layer();
        stageRef.current.add(layerRef.current);
        
        trRef.current = new Konva.Transformer({
            keepRatio: false,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'],
             boundBoxFunc: (oldBox, newBox) => {
                newBox.width = Math.max(30, newBox.width);
                newBox.height = Math.max(20, newBox.height);
                return newBox;
            }
        });
        layerRef.current.add(trRef.current);

        const stage = stageRef.current;

        stage.on('wheel', (e) => {
            e.evt.preventDefault();
            const scaleBy = 1.05;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            if (!pointer) return;

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
            const clampedScale = Math.max(0.1, Math.min(3.0, newScale));
            
            onZoomChange(clampedScale);

            const newPos = {
                x: pointer.x - mousePointTo.x * clampedScale,
                y: pointer.y - mousePointTo.y * clampedScale,
            };
            stage.position(newPos);
        });

        stage.on('click tap', (e) => {
            if (e.target === stage || !e.target.getAttr('draggable')) {
                onSelectedElementsChange([]);
                return;
            }
            
            const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
            const clickedId = e.target.id();
            const isSelected = selectedElements.some(el => el.id === clickedId);
            
            if (!metaPressed) {
                const clickedElement = elements.find(el => el.id === clickedId);
                onSelectedElementsChange(clickedElement ? [{ id: clickedId, type: clickedElement.type, style: clickedElement.style }] : []);
            } else {
                if (isSelected) {
                    onSelectedElementsChange(prev => prev.filter(el => el.id !== clickedId));
                } else {
                    const clickedElement = elements.find(el => el.id === clickedId);
                    if(clickedElement) {
                        onSelectedElementsChange(prev => [...prev, { id: clickedId, type: clickedElement.type, style: clickedElement.style }]);
                    }
                }
            }
        });
        
        stage.on('dblclick dbltap', (e) => {
            if (e.target.className === 'Text') {
                setEditingTextNode(e.target as Konva.Text);
            }
        });

        return () => {
            stage.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, onZoomChange]);
    
    // Handle programmatic zoom changes (e.g., from footer buttons)
    useEffect(() => {
        const stage = stageRef.current;
        if (stage && stage.scaleX() !== zoom) {
            const oldScale = stage.scaleX();
            
            // Zoom to the center of the viewport
            const center = {
                x: stage.width() / 2,
                y: stage.height() / 2,
            };

            const relatedTo = {
                x: (center.x - stage.x()) / oldScale,
                y: (center.y - stage.y()) / oldScale,
            };

            const newPos = {
                x: center.x - relatedTo.x * zoom,
                y: center.y - relatedTo.y * zoom,
            };

            stage.scale({ x: zoom, y: zoom });
            stage.position(newPos);
            stage.batchDraw();
        }
    }, [zoom]);

    // Draw elements
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return;

        layer.destroyChildren();
        layer.add(trRef.current!);
        
        const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

        sortedElements.forEach(el => {
            let shape: Konva.Shape | null = null;
            if (el.type === 'Rect' || (el.type === 'Image' && !el.imageUrl)) {
                shape = new Konva.Rect({
                    id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, draggable: el.draggable,
                    ...el.style,
                });
            } else if (el.type === 'Image' && el.imageUrl) {
                const imageNode = new Konva.Image({
                    id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, draggable: el.draggable,
                    // FIX: The `image` property is required by `Konva.ImageConfig`. Initialize as undefined; it will be set later when the image loads.
                    image: undefined,
                    ...el.style,
                });
                if (imageCache.current.has(el.imageUrl)) {
                    imageNode.image(imageCache.current.get(el.imageUrl));
                } else {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = el.imageUrl;
                    img.onload = () => {
                        imageNode.image(img);
                        layer.batchDraw();
                    };
                    imageCache.current.set(el.imageUrl, img);
                }
                shape = imageNode;
            } else if (el.type === 'Text') {
                shape = new Konva.Text({
                    id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, draggable: el.draggable,
                    text: el.text,
                    ...el.style,
                });
                shape.on('transform', () => {
                    shape!.setAttrs({
                        width: shape!.width() * shape!.scaleX(),
                        height: shape!.height() * shape!.scaleY(),
                        scaleX: 1, scaleY: 1
                    });
                });
            }

            if (shape) {
                shape.on('dragend', (e) => {
                     onElementsChange(prev => prev.map(elem => 
                        elem.id === e.target.id() ? { ...elem, x: e.target.x(), y: e.target.y() } : elem
                     ));
                });
                shape.on('transformend', (e) => {
                    onElementsChange(prev => prev.map(elem => {
                        // FIX: Cast e.target to Konva.Shape to resolve TypeScript error where it was inferred as 'unknown'.
                        const node = e.target as Konva.Shape;
                        if (elem.id === node.id()) {
                            return { 
                                ...elem, 
                                x: node.x(), 
                                y: node.y(),
                                width: node.width() * node.scaleX(),
                                height: node.height() * node.scaleY(),
                            }
                        }
                        return elem;
                     }));
                });
                layer.add(shape);
            }
        });
        layer.batchDraw();
    }, [elements, onElementsChange]);

    // Update Transformer
    useEffect(() => {
        const tr = trRef.current;
        const layer = layerRef.current;
        const stage = stageRef.current;
        if (!tr || !layer || !stage) return;
        
        const selectedIds = new Set(selectedElements.map(el => el.id));
        const nodes = Array.from(layer.children).filter(node => selectedIds.has(node.id()));
        
        tr.nodes(nodes as Konva.Node[]);
        layer.batchDraw();
    }, [selectedElements]);

    // Handle Text Editing
    useEffect(() => {
        if (!editingTextNode) {
            trRef.current?.show();
            return;
        }

        const stage = stageRef.current!;
        const textNode = editingTextNode;
        textNode.hide();
        trRef.current?.hide();
        layerRef.current?.batchDraw();

        const stageBox = stage.container().getBoundingClientRect();
        const textPosition = textNode.absolutePosition();
        const areaPosition = {
            x: stageBox.left + textPosition.x * stage.scaleX() + stage.x(),
            y: stageBox.top + textPosition.y * stage.scaleY() + stage.y()
        };

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        
        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${textNode.width() * stage.scaleX()}px`;
        textarea.style.height = `${textNode.height() * stage.scaleY()}px`;
        textarea.style.fontSize = `${textNode.fontSize() * stage.scaleX()}px`;
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.border = '2px solid #0ea5e9';
        textarea.style.padding = '4px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = textNode.lineHeight().toString();
        // FIX: textNode.fill() can return a CanvasGradient, which is not assignable to style.color. We ensure the value is a string.
        const fillColor = textNode.fill();
        if (typeof fillColor === 'string') {
            textarea.style.color = fillColor;
        }
        textarea.style.textAlign = textNode.align();
        textarea.style.zIndex = '1000';
        
        textarea.focus();
        
        const removeTextarea = () => {
            textarea.remove();
            window.removeEventListener('click', handleOutsideClick);
            textNode.show();
            setEditingTextNode(null);
        };
        
        const handleOutsideClick = (e: MouseEvent) => {
            if (e.target !== textarea) {
                onTextChange(textNode.id(), textarea.value);
                removeTextarea();
            }
        };
        
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                onTextChange(textNode.id(), textarea.value);
                removeTextarea();
            }
            if (e.key === 'Escape') {
                removeTextarea();
            }
        });
        
        setTimeout(() => {
            window.addEventListener('click', handleOutsideClick);
        }, 0);

        return () => {
            textarea.remove();
            window.removeEventListener('click', handleOutsideClick);
        };
    }, [editingTextNode, onTextChange, zoom]);

    return <div ref={containerRef} className="bg-white shadow-lg" style={{ width, height }} />;
};
