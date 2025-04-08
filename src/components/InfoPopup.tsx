import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoPopupProps {
    text?: string;
    title?: string;
    content?: React.ReactNode;
    darkMode?: boolean;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ text, title, content, darkMode = false }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="cursor-help">
                <Info size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </span>
            {isVisible && (
                <div
                    className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-72 p-3 rounded-md shadow-lg text-sm z-10 ${
                        darkMode
                            ? 'bg-gray-900 border border-gray-700 text-gray-200'
                            : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                    role="tooltip"
                >
                    {title && (
                        <div className="font-medium mb-1.5">{title}</div>
                    )}
                    {text && <div>{text}</div>}
                    {content && <div>{content}</div>}
                </div>
            )}
        </div>
    );
};

export default InfoPopup;
