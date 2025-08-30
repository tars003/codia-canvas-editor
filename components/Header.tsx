import React from 'react';

interface HeaderProps {
    onLoadSample: () => void;
    onPasteJson: () => void;
    onAddText: () => void;
    onAddImage: () => void;
    onExport: () => void;
    hasElements: boolean;
}

const HeaderButton: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
    <button
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        {...props}
    >
        {children}
    </button>
);

const PrimaryButton: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
     <button
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        {...props}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({
    onLoadSample,
    onPasteJson,
    onAddText,
    onAddImage,
    onExport,
    hasElements,
}) => {
    return (
        <header className="bg-white border-b border-gray-200 p-3 z-20">
            <div className="container mx-auto flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800 whitespace-nowrap">Codia AI Editor</h1>

                <div className="flex items-center gap-2">
                    <HeaderButton onClick={onLoadSample}>Load Sample</HeaderButton>
                    <HeaderButton onClick={onPasteJson}>Paste JSON</HeaderButton>
                </div>

                <div className="flex items-center gap-2">
                    <HeaderButton onClick={onAddText}>Add Text</HeaderButton>
                    <HeaderButton onClick={onAddImage}>Add Image</HeaderButton>
                    <PrimaryButton onClick={onExport} disabled={!hasElements}>Export</PrimaryButton>
                </div>
            </div>
        </header>
    );
};
