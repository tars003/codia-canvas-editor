
import React, { useState } from 'react';

interface JsonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (jsonString: string) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!jsonInput.trim()) {
            setError('Please paste your JSON data.');
            return;
        }
        try {
            JSON.parse(jsonInput); // Pre-validate JSON
            setError('');
            onSubmit(jsonInput);
        } catch (e) {
            setError('Invalid JSON format. Please check your data.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-semibold text-gray-800">Paste Codia JSON Data</h2>
                    <p className="text-gray-600 mt-1">Paste the full JSON response from the Codia API below.</p>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <textarea
                        id="jsonInput"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-80 p-3 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder='{ "code": 0, "message": "ok", "data": { ... } }'
                    ></textarea>
                    {error && <div className="text-red-600 mt-3 text-sm">{error}</div>}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Load Data
                    </button>
                </div>
            </div>
        </div>
    );
};
