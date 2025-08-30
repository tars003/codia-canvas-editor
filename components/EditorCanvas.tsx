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
    onZoomChange,
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
                 // If it's already selected and it's the only one, do nothing (keep selection)
                return currentSelection;
            }
        });
    }, [onSelectedElementsChange, handleDeselectAll]);


    // Moved from useEffect to prevent stale closures when elements are updated.
    // These handlers use functional updates to work with the latest state.
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
            onZoomChange(newScale);
            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
        });

        return () => {
            stage.destroy();
            stageRef.current = null;
        };
    }, [width, height, onZoomChange, handleSelect]);

    // Update zoom
    useEffect(() => {
        if (stageRef.current && stageRef.current.scaleX() !== zoom) {
            stageRef.current.scale({ x: zoom, y: zoom });
            stageRef.current.batchDraw();
        }
    }, [zoom]);


     // Redraw elements when `elements` prop changes
    useEffect(() => {
        if (!layerRef.current) return;
        const layer = layerRef.current;

        const elementIds = new Set(elements.map(el => el.id));
        
        // Remove nodes that are no longer in the elements array
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

            if (node) { // Update existing node
                 const updateAttrs = {
                     ...commonAttrs,
                     ...elData.style,
                     ...(elData.type === 'Text' && { text: elData.text }),
                 };
                 node.setAttrs(updateAttrs);

            } else { // Create new node
                if (elData.type === 'Text') {
                    node = new Konva.Text({ ...commonAttrs, text: elData.text, ...elData.style });
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
                        layer.batchDraw();
                    } else {
                        const img = new Image();
                        img.src = elData.imageUrl;
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            imageCache.current.set(elData.imageUrl!, img);
                            if (konvaImage.getStage()) { // Check if node is still mounted
                                konvaImage.image(img);
                                layer.batchDraw();
                            }
                        };
                    }
                }
            }
        });

        layer.batchDraw();
    }, [elements, handleDragEnd, handleTransformEnd]);

    // Update Transformer
    useEffect(() => {
        if (!trRef.current || !layerRef.current) return;
        const tr = trRef.current;
        const layer = layerRef.current;
        const selectedIds = new Set(selectedElements.map(el => el.id));

        const nodesToTransform: Konva.Node[] = [];
        layer.find(`.${ELEMENT_CLASS}`).forEach(node => {
            if (selectedIds.has(node.id())) {
                nodesToTransform.push(node);
            }
        });

        // FIX: Konva Transformer expects an array of Shapes or Groups, but stage.find() returns generic Nodes.
        // We filter the array with a type guard to ensure we only pass compatible node types.
        const shapeNodes = nodesToTransform.filter((node): node is Konva.Shape | Konva.Group => node instanceof Konva.Shape || node instanceof Konva.Group);
        tr.nodes(shapeNodes);
        
        if (shapeNodes.length === 0) {
            tr.hide();
        } else {
            tr.show();
        }

        layer.batchDraw();
    }, [selectedElements]);

    return <div ref={containerRef} className="bg-white shadow-lg" style={{ width, height }} />;
};
