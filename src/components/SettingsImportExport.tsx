import React, { useState } from 'react';
import type { Settings } from '../utils/settings';
import { exportSettings, importSettings } from '../utils/settings';
import { Download, Upload, Check, AlertTriangle, X } from 'lucide-react';

interface SettingsImportExportProps {
    currentSettings: Settings;
    onSettingsChange: (settings: Settings) => void;
}

const SettingsImportExport: React.FC<SettingsImportExportProps> = ({
    currentSettings,
    onSettingsChange,
}) => {
    const [importStatus, setImportStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
        errors?: string[];
    }>({ type: null, message: '' });

    const handleExport = () => {
        const settingsJson = exportSettings(currentSettings);
        const blob = new Blob([settingsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jira-url-wizard-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input
        event.target.value = '';

        // Check file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setImportStatus({
                type: 'error',
                message: 'Invalid file type. Please upload a JSON file.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result as string;
                const importedSettings = importSettings(jsonString);
                onSettingsChange(importedSettings);
                setImportStatus({
                    type: 'success',
                    message: 'Settings imported successfully!',
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to import settings';
                
                // Display the main error message
                let displayMessage = 'Failed to import settings.';
                let errors: string[] = [];
                
                // Handle specific error types
                if (errorMessage.includes('does not contain valid JSON')) {
                    displayMessage = 'The file is not a valid settings file.';
                    errors = [errorMessage];
                } else if (errorMessage.includes('Invalid settings structure')) {
                    displayMessage = 'The file contains invalid settings data.';
                    errors = errorMessage.split(': ')[1]?.split(', ') || [];
                } else {
                    errors = [errorMessage];
                }
                
                setImportStatus({
                    type: 'error',
                    message: displayMessage,
                    errors: errors,
                });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Download size={16} />
                    Export Settings
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                    <Upload size={16} />
                    Import Settings
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </label>
            </div>

            {importStatus.type && (
                <div
                    className={`p-3 rounded-md ${
                        importStatus.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {importStatus.type === 'success' ? (
                            <Check size={16} />
                        ) : (
                            <AlertTriangle size={16} />
                        )}
                        <span>{importStatus.message}</span>
                    </div>
                    
                    {importStatus.errors && importStatus.errors.length > 0 && (
                        <ul className="mt-2 ml-6 list-disc">
                            {importStatus.errors.map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <X size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SettingsImportExport; 