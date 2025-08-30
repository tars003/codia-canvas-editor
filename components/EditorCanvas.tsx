
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Konva from 'konva';
import { CanvasElement, SelectedElement, ElementStyle } from '../types';

interface EditorCanvasProps {
    elements: CanvasElement[];
    onElementsChange: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
    selectedElements: SelectedElement[];
    onSelectedElementsChange: React.Dispatch<React.SetStateAction<SelectedElement[]>>;
    width: number;
    height: number;
    onTextChange: (id: string, newText: string) => void;
    zoom: number;
}

const ELEMENT_CLASS = 'canvas-element';

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    elements,
    onElementsChange,
    selectedElements,
    onSelectedElementsChange,
    width,
    height,
    onTextChange,
    zoom,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const layerRef = useRef<Konva.Layer | null>(null);
    const trRef = useRef<Konva.Transformer | null>(null);
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const [editingTextNode, setEditingTextNode] = useState<Konva.Text | null>(null);

    const handleDeselectAll = useCallback(() => {
        onSelectedElementsChange([]);
    }, [onSelectedElementsChange]);


    const handleSelect = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        // Do not trigger selection if we are trying to edit text
        if (e.target.getAttr('isEditing')) return;
        
        const clickedNode = e.target;
        const isElement = clickedNode.name() === ELEMENT_CLASS;

        if (!isElement) {
            handleDeselectAll();
            return;
        }

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const newSelectionItem = {
            id: clickedNode.id(),
            type: clickedNode.getAttr('elementType'),
            style: clickedNode.getAttr('elementStyle'),
        };

        onSelectedElementsChange(currentSelection => {
            const isSelected = currentSelection.some(el => el.id === clickedNode.id());

            if (metaPressed) {
                if (isSelected) {
                    return currentSelection.filter(el => el.id !== clickedNode.id());
                } else {
                    return [...currentSelection, newSelectionItem];
                }
            } else {
                if (!isSelected || currentSelection.length > 1) {
                    return [newSelectionItem];
                }
                return currentSelection;
            }
        });
    }, [onSelectedElementsChange, handleDeselectAll]);


    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        onElementsChange(prev => prev.map(el =>
            el.id === node.id() ? { ...el, x: node.x(), y: node.y() } : el
        ));
    }, [onElementsChange]);

    const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<any>) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        
        onElementsChange(prev => prev.map(el =>
            el.id === node.id() ? {
                ...el,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                style: { ...el.style, rotation: node.rotation() }
            } : el
        ));
    }, [onElementsChange]);

    const handleTextDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        const textNode = e.target as Konva.Text;
        textNode.setAttr('isEditing', true); // Custom attribute to prevent selection
        setEditingTextNode(textNode);
    }, []);


    // Initialize Stage
    useEffect(() => {
        if (!containerRef.current || stageRef.current) return;
        
        const stage = new Konva.Stage({
            container: containerRef.current,
            width: width,
            height: height,
            draggable: true,
        });
        stageRef.current = stage;

        const layer = new Konva.Layer();
        layerRef.current = layer;
        stage.add(layer);
        
        const tr = new Konva.Transformer({
            keepRatio: false,
             boundBoxFunc: (oldBox, newBox) => {
                newBox.width = Math.max(30, newBox.width);
                newBox.height = Math.max(20, newBox.height);
                return newBox;
            },
            rotationSnaps: [0, 90, 180, 270],
        });
        trRef.current = tr;
        layer.add(tr);

        stage.on('click tap', handleSelect);

        return () => {
            stage.destroy();
            stageRef.current = null;
        };
    }, [width, height, handleSelect]);

    // Update zoom and center the stage
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        if (oldScale === zoom) return;

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
    }, [zoom]);


     // Redraw elements when `elements` prop changes
    useEffect(() => {
        if (!layerRef.current) return;
        const layer = layerRef.current;

        const elementIds = new Set(elements.map(el => el.id));
        
        layer.find(`.${ELEMENT_CLASS}`).forEach(node => {
            if (!elementIds.has(node.id())) {
                node.destroy();
            }
        });

        elements.forEach(elData => {
            let node = layer.findOne(`#${elData.id}`);

            const commonAttrs = {
                id: elData.id,
                name: ELEMENT_CLASS,
                x: elData.x, y: elData.y,
                width: elData.width, height: elData.height,
                draggable: elData.draggable,
                rotation: elData.style.rotation || 0,
                scaleX: 1, scaleY: 1,
                opacity: elData.style.opacity,
            };

            if (node) {
                 const updateAttrs = {
                     ...commonAttrs,
                     ...elData.style,
                     ...(elData.type === 'Text' && { text: elData.text }),
                 };
                 node.setAttrs(updateAttrs);

            } else {
                if (elData.type === 'Text') {
                    node = new Konva.Text({ ...commonAttrs, text: elData.text, ...elData.style });
                    node.on('dblclick dbltap', handleTextDblClick);
                } else if (elData.type === 'Rect') {
                    node = new Konva.Rect({ ...commonAttrs, ...elData.style });
                } else if (elData.type === 'Image' && elData.imageUrl) {
                    node = new Konva.Image({ ...commonAttrs, ...elData.style, image: undefined });
                }
                
                if (node) {
                    node.on('dragend', handleDragEnd);
                    node.on('transformend', handleTransformEnd);
                    layer.add(node);
                }
            }

            if (node) {
                node.setAttr('elementStyle', elData.style);
                node.setAttr('elementType', elData.type);
                node.zIndex(elData.zIndex);

                if (elData.type === 'Image' && elData.imageUrl) {
                    const konvaImage = node as Konva.Image;
                    const cachedImg = imageCache.current.get(elData.imageUrl);
                    if (cachedImg) {
                        konvaImage.image(cachedImg);
                    } else {
                        const img = new Image();
                        img.src = elData.imageUrl;
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            imageCache.current.set(elData.imageUrl!, img);
                            if (konvaImage.getStage()) {
                                konvaImage.image(img);
                                layer.batchDraw();
                            }
                        };
                    }
                }
            }
        });

        layer.batchDraw();
    }, [elements, handleDragEnd, handleTransformEnd, handleTextDblClick]);

    // Handle inline text editing
    useEffect(() => {
        if (!editingTextNode) return;

        const stage = stageRef.current;
        if (!stage || !stage.container()) return;
        
        editingTextNode.hide();
        trRef.current?.hide();
        layerRef.current?.draw();

        const textarea = document.createElement('textarea');
        stage.container().appendChild(textarea);
        
        const textPosition = editingTextNode.absolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };

        const rotation = editingTextNode.rotation();
        const scale = editingTextNode.scaleX() * stage.scaleX();

        Object.assign(textarea.style, {
            position: 'absolute',
            top: `${areaPosition.y}px`,
            left: `${areaPosition.x}px`,
            width: `${editingTextNode.width() * scale}px`,
            height: `${editingTextNode.height() * scale + 5}px`,
            fontSize: `${editingTextNode.fontSize() * scale}px`,
            fontFamily: editingTextNode.fontFamily(),
            fontStyle: editingTextNode.fontStyle(),
            fontWeight: editingTextNode.getAttr('elementStyle')?.fontWeight || 'normal',
            textAlign: editingTextNode.align() as any,
            lineHeight: editingTextNode.lineHeight().toString(),
            color: editingTextNode.fill(),
            border: '1px solid #666',
            padding: '0px',
            margin: '0px',
            overflow: 'hidden',
            background: 'white',
            outline: 'none',
            resize: 'none',
            transformOrigin: 'left top',
            transform: `rotate(${rotation}deg)`,
            zIndex: '100',
        });
        
        textarea.value = editingTextNode.text();
        textarea.focus();
        textarea.select();

        const finishEditing = () => {
            const newText = textarea.value;
            onTextChange(editingTextNode.id(), newText);
            setEditingTextNode(null);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                setEditingTextNode(null);
            }
        };
        
        textarea.addEventListener('keydown', handleKeyDown);
        textarea.addEventListener('blur', finishEditing);
        
        return () => {
            textarea.removeEventListener('keydown', handleKeyDown);
            textarea.removeEventListener('blur', finishEditing);
            textarea.parentNode?.removeChild(textarea);

            if (editingTextNode.getStage()) {
                editingTextNode.setAttr('isEditing', false);
                editingTextNode.show();
                layerRef.current?.draw();
            }
        };

    }, [editingTextNode, onTextChange]);

    useEffect(() => {
        if (!trRef.current || !layerRef.current) return;
        const tr = trRef.current;
        const layer = layerRef.current;
        
        const selectedIds = new Set(selectedElements.map(el => el.id));
        const draggableSelectedIds = new Set(
            elements
                .filter(el => selectedIds.has(el.id) && el.draggable)
                .map(el => el.id)
        );

        const nodes = layer.find(`.${ELEMENT_CLASS}`);
        
        // Fix: Explicitly filter for Shape or Group instances to satisfy the Transformer's requirements.
        // The result of `find` is a standard array of nodes.
        // We filter this array to get only the selected and draggable shapes for the transformer.
        const shapeNodes = nodes.filter((node): node is Konva.Shape | Konva.Group => {
            return draggableSelectedIds.has(node.id()) && (node instanceof Konva.Shape || node instanceof Konva.Group);
        });

        tr.nodes(shapeNodes);
        
        if (shapeNodes.length === 0 || editingTextNode) {
            tr.hide();
        } else {
            tr.show();
            tr.moveToTop();
        }

        layer.batchDraw();
    }, [selectedElements, elements, editingTextNode]);

    return <div ref={containerRef} className="bg-white shadow-lg rounded-md" style={{ width, height }} />;
};
