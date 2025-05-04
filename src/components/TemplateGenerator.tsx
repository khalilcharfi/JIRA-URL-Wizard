import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import MarkdownLinkGenerator from './MarkdownLinkGenerator';
import { Clipboard, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TemplateGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const [copied, setCopied] = useState<boolean>(false);
  
  const { 
    urls = { bo: "", mobile: "", desktop: "", drupal7: "", drupal9: "" },
    ticketTypes = ["MOBILE", "DESKTOP", "BO"],
    prefixes = ["FEATURE", "BUG", "TASK"],
    urlStructure = []
  } = settings;

  // Reset copy indicator after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Save pattern to settings
  const handleSavePattern = (newPattern: string[]) => {
    updateSettings({ ...settings, urlStructure: newPattern });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">{t('sections.templateGenerator')}</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 mb-6">
        <MarkdownLinkGenerator 
          prefixes={prefixes}
          ticketTypes={ticketTypes}
          urls={urls}
          urlStructure={urlStructure}
          onSavePattern={handleSavePattern}
        />
      </div>
    </div>
  );
};

export default TemplateGenerator; 