import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertIcon } from '../assets/imageAssets';

interface SettingsOverlayProps {
  isVisible: boolean;
  onOpenSettings: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ 
  isVisible, 
  onOpenSettings 
}) => {
  const { t } = useTranslation();
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 dark:bg-gray-900/95 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-overlay-title"
      onClick={(e) => e.stopPropagation()}
      style={{ height: '235px' }}
    >
      <div className="w-[468px] h-[235px] p-5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 rounded-md shadow-lg text-center flex flex-col items-center justify-center">
        <AlertIcon 
          size={48} 
          strokeWidth={2}
          className="mx-auto mb-3 text-amber-600 dark:text-amber-400"
        />
        <h3 
          className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2"
          id="settings-overlay-title"
        >
          {t('messages.configurationNeeded')}
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
          {t('messages.noEnvironmentsConfigured')}
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-amber-600 text-white dark:bg-amber-700 rounded-md hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
        >
          {t('navigation.openSettings')}
        </button>
      </div>
    </div>
  );
};

export default SettingsOverlay; 