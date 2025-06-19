import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsStorage } from '../shared/settings';
import { Storage } from '@plasmohq/storage';
import { SHOW_MARKDOWN_EDITOR } from '../utils/config';
import { useSettings } from '../hooks/useSettings';
import { urlUtils } from '../services/templateService';
import './MarkdownTemplateEditor.css';

interface MarkdownTemplateEditorProps {
  initialContent?: string;
  onChange?: (html: string, markdown: string) => void;
  placeholder?: string;
  className?: string;
  buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string;
  pattern?: string[];
}

const MarkdownTemplateEditor: React.FC<MarkdownTemplateEditorProps> = ({
  initialContent = '# Start writing your markdown here...\n\n## This is a heading\n\nYou can write **bold text** and *italic text*.\n\n- List items\n- Are easy to create\n- Just use dashes\n\n> Blockquotes are great for highlighting important information\n\n```javascript\n// Code blocks support syntax highlighting\nconst greeting = \'Hello, World!\';\n```\n\n[Links](https://example.com) and `inline code` work too!',
  onChange,
  placeholder = '# Start writing your markdown here...',
  className = '',
  buildUrlForBase,
  pattern = []
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.value = initialContent;
      updatePreview();
    }
  }, [initialContent]);

  const insertText = (before: string, after: string) => {
    if (!editorRef.current) return;

    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = editorRef.current.value;
    const selectedText = text.substring(start, end);
    
    // Check if the selected text or surrounding text already has the formatting
    const beforeLength = before.length;
    const afterLength = after.length;
    const textBefore = text.substring(start - beforeLength, start);
    const textAfter = text.substring(end, end + afterLength);
    
    let newText, newCursorStart, newCursorEnd;
    
    // If text is already wrapped with the formatting, remove it
    if (textBefore === before && textAfter === after) {
      newText = text.substring(0, start - beforeLength) + selectedText + text.substring(end + afterLength);
      newCursorStart = start - beforeLength;
      newCursorEnd = end - beforeLength;
    }
    // If selected text itself contains the formatting, remove it
    else if (selectedText.startsWith(before) && selectedText.endsWith(after) && selectedText.length > beforeLength + afterLength) {
      const unwrappedText = selectedText.substring(beforeLength, selectedText.length - afterLength);
      newText = text.substring(0, start) + unwrappedText + text.substring(end);
      newCursorStart = start;
      newCursorEnd = start + unwrappedText.length;
    }
    // Otherwise, add the formatting
    else {
      newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      newCursorStart = start + beforeLength;
      newCursorEnd = end + beforeLength;
    }
    
    editorRef.current.value = newText;
    editorRef.current.setSelectionRange(newCursorStart, newCursorEnd);
    editorRef.current.focus();
    
    setContent(newText);
    updatePreview();
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)');
          break;
      }
    }
    
    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      
      target.value = value.substring(0, start) + '    ' + value.substring(end);
      target.setSelectionRange(start + 4, start + 4);
      setContent(target.value);
      updatePreview();
    }
  };

  const toggleView = () => {
    switch(viewMode) {
      case 'split':
        setViewMode('editor');
        break;
      case 'editor':
        setViewMode('preview');
        break;
      case 'preview':
        setViewMode('split');
        break;
    }
  };

  const clearEditor = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      if (editorRef.current) {
        editorRef.current.value = '';
        setContent('');
        updatePreview();
        editorRef.current.focus();
      }
    }
  };

  const insertTemplate = (template: string) => {
    if (!editorRef.current) return;

    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = editorRef.current.value;
    
    const newText = text.substring(0, start) + template + text.substring(end);
    
    editorRef.current.value = newText;
    editorRef.current.setSelectionRange(start + template.length, start + template.length);
    editorRef.current.focus();
    
    setContent(newText);
    updatePreview();
  };

  const replaceTemplateVariables = (markdown: string): string => {
    // Return early if we don't have the necessary functions or data
    if (!buildUrlForBase || !pattern || pattern.length === 0) {
      return markdown;
    }
    
    try {
      // Use the exact same buildUrlForBase function that the URL Preview uses
      // This ensures 100% consistency with what users see in the URL Preview section
      const processedUrls = {
        bo: buildUrlForBase(settings.urls?.bo, pattern),
        mobile: buildUrlForBase(settings.urls?.mobile, pattern),
        desktop: buildUrlForBase(settings.urls?.desktop, pattern),
        drupal7: buildUrlForBase(settings.urls?.drupal7, pattern),
        drupal9: buildUrlForBase(settings.urls?.drupal9, pattern)
      };
      
      let result = markdown;
      // Only replace if we have a valid URL and it's not just a template pattern
      if (processedUrls.bo && !processedUrls.bo.includes('[') && !processedUrls.bo.includes('your-jira.example.com')) {
        result = result.replace(/\{URL_BO\}/g, processedUrls.bo);
      }
      if (processedUrls.mobile && !processedUrls.mobile.includes('[') && !processedUrls.mobile.includes('your-jira.example.com')) {
        result = result.replace(/\{URL_MOBILE\}/g, processedUrls.mobile);
      }
      if (processedUrls.desktop && !processedUrls.desktop.includes('[') && !processedUrls.desktop.includes('your-jira.example.com')) {
        result = result.replace(/\{URL_DESKTOP\}/g, processedUrls.desktop);
      }
      if (processedUrls.drupal7 && !processedUrls.drupal7.includes('[') && !processedUrls.drupal7.includes('your-jira.example.com')) {
        result = result.replace(/\{URL_DRUPAL7\}/g, processedUrls.drupal7);
      }
      if (processedUrls.drupal9 && !processedUrls.drupal9.includes('[') && !processedUrls.drupal9.includes('your-jira.example.com')) {
        result = result.replace(/\{URL_DRUPAL9\}/g, processedUrls.drupal9);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing URLs in markdown preview:', error);
      return markdown;
    }
  };

  const updatePreview = () => {
    if (!previewRef.current || !editorRef.current) return;

    const markdown = editorRef.current.value;
    setContent(markdown);
    
    // Replace template variables before parsing markdown
    const processedMarkdown = replaceTemplateVariables(markdown);
    previewRef.current.innerHTML = parseMarkdown(processedMarkdown);
    
    if (onChange) {
      onChange(previewRef.current.innerHTML, markdown);
    }
  };

  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return '';

    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Lists
    html = html.replace(/^\* (.*)/gm, '<li>$1</li>');
    html = html.replace(/^- (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Blockquotes
    html = html.replace(/^> (.*)/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    
    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    
    return html;
  };

  const getToggleButtonText = () => {
    switch(viewMode) {
      case 'split': return '⚡ Split View';
      case 'editor': return '📝 Editor Only';
      case 'preview': return '👁 Preview Only';
    }
  };

  // Return null if markdown editor is disabled via environment variable
  if (!SHOW_MARKDOWN_EDITOR) {
    return null;
  }

  return (
    <div className={`markdown-editor ${className}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="markdown-toolbar">
        <button onClick={toggleView}>
          {getToggleButtonText()}
        </button>
        <button onClick={() => insertText('**', '**')}>
          <span style={{ fontWeight: 'bold' }}>B</span>
          Bold
        </button>
        <button onClick={() => insertText('*', '*')}>
          <span style={{ fontStyle: 'italic' }}>I</span>
          Italic
        </button>
        <button onClick={() => insertText('[', '](url)')}>
          🔗 Link
        </button>
        <button onClick={() => insertText('`', '`')}>
          &lt;/&gt; Code
        </button>
        <button onClick={() => insertText('\n- ', '')}>
          • List
        </button>
        <div className="toolbar-separator"></div>
        <button onClick={() => insertTemplate('{URL_BO}')} title="Insert URL_BO template">
          📱 BO
        </button>
        <button onClick={() => insertTemplate('{URL_MOBILE}')} title="Insert URL_MOBILE template">
          📱 Mobile
        </button>
        <button onClick={() => insertTemplate('{URL_DESKTOP}')} title="Insert URL_DESKTOP template">
          🖥️ Desktop
        </button>
        <button onClick={() => insertTemplate('{URL_DRUPAL7}')} title="Insert URL_DRUPAL7 template">
          🌐 D7
        </button>
        <button onClick={() => insertTemplate('{URL_DRUPAL9}')} title="Insert URL_DRUPAL9 template">
          🌐 D9
        </button>
        <button onClick={clearEditor}>
          × Clear
        </button>
      </div>

      <div className="markdown-editor-container">
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className="markdown-editor-pane">
            <div className="markdown-pane-header">Markdown</div>
            <textarea
              ref={editorRef}
              className="markdown-textarea"
              placeholder={placeholder}
              onChange={updatePreview}
              onKeyDown={handleKeydown}
              defaultValue={initialContent}
            />
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="markdown-preview-pane">
            <div className="markdown-pane-header">Preview</div>
            <div 
              ref={previewRef}
              className={`markdown-preview ${viewMode === 'preview' ? 'single-pane' : ''}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownTemplateEditor; 