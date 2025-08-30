
export interface CodiaData {
    code: number;
    message: string;
    data: {
        configuration: {
            baseWidth: number;
            baseHeight?: number;
        };
        visualElement: VisualElement;
    };
}

export interface VisualElement {
    elementId: string;
    elementType: 'Layer' | 'Image' | 'Text';
    elementName?: string;
    layoutConfig?: {
        absoluteAttrs?: {
            coord: [number, number];
            orginCoord?: [number, number];
        };
    };
    styleConfig: {
        widthSpec: { value: number };
        heightSpec: { value: number };
        opacityLevel?: number;
        textColor?: { rgbValues: [number, number, number] };
        borderConfig?: {
            borderWidth?: number;
            borderColor?: { rgbValues: [number, number, number] };
            borderRadius?: [number, number, number, number];
        };
        textConfig?: {
            fontFamilyRec?: string;
            fontFamily: string;
            fontSize: number;
            fontStyle?: string;
            textAlign: [string, string];
        };
    };
    contentData?: {
        textValue?: string;
        imageSource?: string;
    };
    childElements?: VisualElement[];
}

export interface ElementStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    opacity: number;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    align?: 'left' | 'center' | 'right';
}

export interface CanvasElement {
    id: string;
    type: 'Rect' | 'Image' | 'Text';
    x: number;
    y: number;
    width: number;
    height: number;
    draggable: boolean;
    zIndex: number;
    style: ElementStyle;
    text?: string;
    imageUrl?: string;
    originalData: VisualElement;
}

export interface SelectedElement {
    id: string;
    type: 'Rect' | 'Image' | 'Text';
    style: ElementStyle;
}
