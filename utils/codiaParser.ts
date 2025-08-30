import { VisualElement, CanvasElement, ElementStyle } from '../types';

const rgbToHex = (rgb: [number, number, number] | undefined): string => {
    if (!rgb) return '#000000';
    return '#' + rgb.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};

const getFontFamily = (family: string | undefined): string => {
    const fallbacks: { [key: string]: string } = {
        'Inter': 'Inter, sans-serif',
        'Montserrat': 'Montserrat, sans-serif',
        'Times New Roman': '"Times New Roman", Times, serif',
        'DM Serif Text': '"DM Serif Text", serif',
        'Ibarra Real Nova': '"Ibarra Real Nova", serif',
        'Caveat': 'Caveat, cursive',
    };
    return family ? (fallbacks[family] || `${family}, sans-serif`) : 'Arial, sans-serif';
};

const getFontProperties = (style: string | undefined): { fontStyle: 'normal' | 'italic', fontWeight: string } => {
    if (!style) return { fontStyle: 'normal', fontWeight: '400' };
    const lowerStyle = style.toLowerCase();
    
    const fontStyle = lowerStyle.includes('italic') ? 'italic' : 'normal';

    const weightMap: { [key: string]: string } = {
        'thin': '100', 'extralight': '200', 'light': '300',
        'regular': '400', 'normal': '400', 'medium': '500',
        'semibold': '600', 'semi_bold': '600', 'bold': '700',
        'extrabold': '800', 'black': '900'
    };
    
    const weightKey = lowerStyle.replace('italic', '').trim();
    const fontWeight = weightMap[weightKey] || '400';

    return { fontStyle, fontWeight };
};

export const parseCodiaData = (rootElement: VisualElement): CanvasElement[] => {
    const flatElements: CanvasElement[] = [];
    let zIndexCounter = 0;

    const traverse = (element: VisualElement, parentCoord: [number, number]) => {
        const coord = element.layoutConfig?.absoluteAttrs?.coord || [0, 0];
        const orginCoord = element.layoutConfig?.absoluteAttrs?.orginCoord;
        
        const x = orginCoord ? orginCoord[0] : parentCoord[0] + coord[0];
        const y = orginCoord ? orginCoord[1] : parentCoord[1] + coord[1];
        
        const width = element.styleConfig.widthSpec.value;
        const height = element.styleConfig.heightSpec.value;
        const opacity = element.styleConfig.opacityLevel !== undefined ? element.styleConfig.opacityLevel / 255 : 1;
        
        zIndexCounter++;

        const baseStyle: Partial<ElementStyle> = {
            opacity,
            rotation: 0,
        };

        // Handle Layer as a background rectangle
        if (element.elementType === 'Layer' && element.styleConfig.textColor) {
            flatElements.push({
                id: element.elementId,
                type: 'Rect',
                x, y, width, height,
                draggable: false,
                zIndex: zIndexCounter,
                style: {
                    ...baseStyle,
                    fill: rgbToHex(element.styleConfig.textColor?.rgbValues),
                    stroke: rgbToHex(element.styleConfig.borderConfig?.borderColor?.rgbValues),
                    strokeWidth: element.styleConfig.borderConfig?.borderWidth || 0,
                    cornerRadius: element.styleConfig.borderConfig?.borderRadius?.[0] || 0
                } as ElementStyle,
                originalData: element,
            });
        }
        
        // Handle Image
        if (element.elementType === 'Image') {
            const elementName = element.elementName?.toLowerCase() || '';
            const isBackgroundImage = elementName.includes('background') || (width >= 800 && height >= 600) || (x === 0 && y === 0);
            
            flatElements.push({
                id: element.elementId,
                type: 'Image',
                x, y, width, height,
                draggable: !isBackgroundImage,
                zIndex: zIndexCounter,
                imageUrl: element.contentData?.imageSource,
                style: {
                   ...baseStyle,
                   // If no image source, it might be a styled rect
                   fill: !element.contentData?.imageSource ? rgbToHex(element.styleConfig.textColor?.rgbValues) : undefined,
                } as ElementStyle,
                originalData: element,
            });
        }
        
        // Handle Text
        if (element.elementType === 'Text' && element.contentData?.textValue) {
            const textConfig = element.styleConfig.textConfig;
            const { fontStyle, fontWeight } = getFontProperties(textConfig?.fontStyle);
            
            flatElements.push({
                id: element.elementId,
                type: 'Text',
                x, y, width, height,
                draggable: true,
                zIndex: zIndexCounter,
                text: element.contentData.textValue.replace(/\\n/g, '\n'),
                style: {
                    ...baseStyle,
                    fill: rgbToHex(element.styleConfig.textColor?.rgbValues),
                    fontFamily: getFontFamily(textConfig?.fontFamilyRec || textConfig?.fontFamily),
                    fontSize: textConfig?.fontSize || 16,
                    fontStyle: fontStyle,
                    fontWeight: fontWeight,
                    align: textConfig?.textAlign[1].toLowerCase() as 'left' | 'center' | 'right',
                    backgroundColor: 'transparent',
                    textDecoration: '',
                } as ElementStyle,
                originalData: element,
            });
        }

        if (element.childElements) {
            // For Layers, children coords are absolute relative to the layer, not the parent.
            const newParentCoord: [number, number] = element.elementType === 'Layer' ? [x, y] : [0,0];
            element.childElements.forEach(child => traverse(child, newParentCoord));
        }
    };
    
    traverse(rootElement, [0, 0]);
    return flatElements;
};