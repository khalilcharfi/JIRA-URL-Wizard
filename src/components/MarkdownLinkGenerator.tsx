import React, { useState, useEffect } from 'react';
import { generateMarkdownLinks, generatePlainTextLinks } from '../services/templateService';
import URLComponentBuilder from './URLComponentBuilder';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { SettingsStorage } from '../shared/settings';

interface MarkdownLinkGeneratorProps {
  prefixes: string[];
  ticketTypes: string[];
  urls: SettingsStorage['urls'];
  urlStructure?: string[];
  onSavePattern?: (pattern: string[]) => void;
  settings?: SettingsStorage;
}

const MarkdownLinkGenerator: React.FC<MarkdownLinkGeneratorProps> = ({
  prefixes,
  ticketTypes,
  urls,
  urlStructure,
  onSavePattern,
  settings
}) => {
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [plainTextOutput, setPlainTextOutput] = useState<string>('');
  const [pattern, setPattern] = useState<string[]>(urlStructure || []);

  // Store the buildUrlForBase function reference
  const [buildUrlFn, setBuildUrlFn] = useState<(baseUrl: string | undefined, pattern: string[]) => string | null>(null);
  
  // When pattern or buildUrlFn changes, update outputs
  useEffect(() => {
    if (buildUrlFn && urls) {
      // Generate outputs using the current pattern and build function
      const markdown = generateMarkdownLinks(urls, buildUrlFn, pattern as UniqueIdentifier[], settings, urlStructure);
      const plainText = generatePlainTextLinks(urls, buildUrlFn, pattern as UniqueIdentifier[], settings, urlStructure);
      
      setMarkdownOutput(markdown);
      setPlainTextOutput(plainText);
    }
  }, [pattern, buildUrlFn, urls, settings, urlStructure]);

  // Handler for saving pattern
  const handleSavePattern = (newPattern: string[]) => {
    setPattern(newPattern);
    if (onSavePattern) {
      onSavePattern(newPattern);
    }
  };

  return (
    <div className="space-y-6">
      <URLComponentBuilder
        prefixes={prefixes}
        ticketTypes={ticketTypes}
        urls={urls || {}}
        urlStructure={urlStructure}
        onSavePattern={handleSavePattern}
        onBuildUrlFunctionReady={(buildFn) => {
          setBuildUrlFn(() => buildFn);
        }}
      />
      
      {buildUrlFn && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Markdown Links</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm">{markdownOutput}</pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Plain Text Links</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <pre className="whitespace-pre-wrap text-sm">{plainTextOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownLinkGenerator; 