import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsStorage } from '../shared/settings';
import { Storage } from '@plasmohq/storage';

interface MarkdownTemplateEditorProps {
  initialContent?: string;
  onChange?: (html: string, markdown: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownTemplateEditor: React.FC<MarkdownTemplateEditorProps> = ({
  initialContent = '🌐💻 Frontend Environments\n- **🛠️ Back Office Tool** → [https://bo.r.f1-int.de](https://bo.r.f1-int.de)\n- **📱 Mobile Version** → [https://m.1.4-int.de?deviceoutput=mobile](https://m.1.4-int.de?deviceoutput=mobile)\n- **🖥️ Desktop Version** → [https://4.d.4-int.de?deviceoutput=desktop](https://4.d.4-int.de?deviceoutput=desktop)\n---\n📝📚 CMS Environments\n💧7️⃣ ## **Drupal 7**\n- **Base CMS** → [https://cms1.sach.vv.check24-int.de/fahrradversicherung](https://cms1.sach.vv.check24-int.de/fahrradversicherung)\n- **Desktop View** → [https://cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop](https://cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop)\n- **Mobile View** → [https://cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile](https://cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile)\n💧9️⃣ ## **Drupal 9**\n- **Desktop View** → [https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop](https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop)\n- **Mobile View** → [https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile](https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile)',
  onChange,
  placeholder = 'Type something... Use {URL_DESKTOP} as placeholder',
  className = ''
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlaceholderPicker, setShowPlaceholderPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [urls, setUrls] = useState({
    mobile: 'https://mobile.example.com',
    desktop: 'https://desktop.example.com',
    bo: 'https://bo.example.com',
    drupal7: 'https://drupal7.example.com',
    drupal9: 'https://drupal9.example.com'
  });

  // Add a state to track currently active formats
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Update the useEffect for URL loading to ensure we correctly handle URL placeholders
  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const storage = new Storage();
        const settings = await storage.get<SettingsStorage>("settings");
        
        if (settings?.urls) {
          // Store the raw URLs from settings
          setUrls(settings.urls);
        }
      } catch (error) {
        console.error("Error loading URLs for placeholders:", error);
      }
    };
    
    fetchUrls();
  }, []);

  // Update the placeholders definition to use the freshly loaded URLs and include device parameters
  useEffect(() => {
    // Update placeholders whenever the URLs change
    setPlaceholders([
      { name: '{URL_DESKTOP}', value: urls.desktop || 'https://desktop.example.com' },
      { name: '{URL_MOBILE}', value: urls.mobile || 'https://mobile.example.com' },
      { name: '{URL_BO}', value: urls.bo || 'https://bo.example.com' },
      { name: '{URL_DRUPAL7}', value: urls.drupal7 || 'https://drupal7.example.com' },
      { name: '{URL_DRUPAL9}', value: urls.drupal9 || 'https://drupal9.example.com' },
      { name: '{URL_DRUPAL7_DESKTOP}', value: `${urls.drupal7 || 'https://drupal7.example.com'}?deviceoutput=desktop` },
      { name: '{URL_DRUPAL7_MOBILE}', value: `${urls.drupal7 || 'https://drupal7.example.com'}?deviceoutput=mobile` },
      { name: '{URL_DRUPAL9_DESKTOP}', value: `${urls.drupal9 || 'https://drupal9.example.com'}?deviceoutput=desktop` },
      { name: '{URL_DRUPAL9_MOBILE}', value: `${urls.drupal9 || 'https://drupal9.example.com'}?deviceoutput=mobile` }
    ]);
  }, [urls]);

  // Add placeholder state
  const [placeholders, setPlaceholders] = useState<Array<{name: string, value: string}>>([
    { name: '{URL_DESKTOP}', value: 'https://desktop.example.com' },
    { name: '{URL_MOBILE}', value: 'https://mobile.example.com' },
    { name: '{URL_BO}', value: 'https://bo.example.com' },
    { name: '{URL_DRUPAL7}', value: 'https://drupal7.example.com' },
    { name: '{URL_DRUPAL9}', value: 'https://drupal9.example.com' },
    { name: '{URL_DRUPAL7_DESKTOP}', value: 'https://drupal7.example.com?deviceoutput=desktop' },
    { name: '{URL_DRUPAL7_MOBILE}', value: 'https://drupal7.example.com?deviceoutput=mobile' },
    { name: '{URL_DRUPAL9_DESKTOP}', value: 'https://drupal9.example.com?deviceoutput=desktop' },
    { name: '{URL_DRUPAL9_MOBILE}', value: 'https://drupal9.example.com?deviceoutput=mobile' }
  ]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerText = initialContent;
    }
  }, [initialContent]);

  // Common emojis for documentation
  const emojis = [
    '🌐', '💻', '📱', '🖥️', '🛠️', // Tech/devices
    '📝', '📚', '📊', '📈', '📋', // Documents
    '💧', '7️⃣', '9️⃣', '🔢', '🔄', // Numbers/water
    '✅', '⚠️', '❌', '🔍', '🔗', // Status
    '😀', '👍', '🎉', '⭐', '🚀'  // Reactions
  ];
  
  const applyFormat = async (format: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText && format !== 'link' && format !== 'separator') return;
    
    // Remove existing formatting before applying new format
    let cleanText = selectedText;
    
    // Clean heading formats (# or ##)
    cleanText = cleanText.replace(/^#+\s+/, '');

    // Special case: Check if text already contains emoji + heading format like "💧7️⃣ ## Text"
    const emojiHeadingMatch = selectedText.match(/([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+\s*)(#+\s+)/u);
    if (emojiHeadingMatch) {
      // Extract emojis and keep them, but remove heading markers
      const emojis = emojiHeadingMatch[1];
      cleanText = selectedText.replace(/([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+\s*)(#+\s+)(.*)/u, '$1$3');
    }
    
    // Clean bold format (**text**)
    cleanText = cleanText.replace(/^\*\*(.*)\*\*$/, '$1');
    
    // Clean italic format (*text*)
    cleanText = cleanText.replace(/^\*(.*)\*$/, '$1');
    
    // Clean underline format (_text_)
    cleanText = cleanText.replace(/^_(.*?)_$/, '$1');
    
    // Clean link format ([text](url))
    cleanText = cleanText.replace(/^\[(.*?)\]\(.*?\)$/, '$1');
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${cleanText}**`;
        break;
      case 'italic':
        formattedText = `*${cleanText}*`;
        break;
      case 'underline':
        formattedText = `_${cleanText}_`;
        break;
      case 'h1':
        formattedText = `# ${cleanText}`;
        break;
      case 'h2':
        // Special handling for emoji+heading combinations
        if (emojiHeadingMatch) {
          const emojis = emojiHeadingMatch[1];
          formattedText = `${emojis}## ${cleanText.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+\s*/u, '')}`;
        } else {
          formattedText = `## ${cleanText}`;
        }
        break;
      case 'link':
        // Create a custom dialog to choose link type
        const linkTypeDialog = document.createElement('div');
        linkTypeDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        linkTypeDialog.innerHTML = `
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full">
            <h3 class="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">${t('editor.chooseLink', 'Choose Link Type')}</h3>
            <div class="space-y-2">
              <button id="custom-url-btn" class="w-full p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-left">
                ${t('editor.customUrl', 'Custom URL')}
              </button>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">${t('editor.orChoosePlaceholder', 'Or choose a placeholder:')}</div>
              ${placeholders.map(p => `
                <button class="placeholder-btn w-full p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-left flex justify-between items-center" data-value="${p.value}">
                  <span class="font-mono text-xs">${p.name}</span>
                  <span class="text-xs text-gray-500 truncate max-w-[200px]">${p.value}</span>
                </button>
              `).join('')}
            </div>
            <div class="mt-4 flex justify-end">
              <button id="cancel-link-btn" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                ${t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(linkTypeDialog);
        
        // Create a Promise to handle async dialog
        const linkSelectionPromise = new Promise<string | null>((resolve) => {
          // Handle custom URL choice
          document.getElementById('custom-url-btn')?.addEventListener('click', () => {
            const url = window.prompt(t('editor.enterLink', 'Enter the URL for the link:'), 'https://');
            resolve(url);
            document.body.removeChild(linkTypeDialog);
          });
          
          // Handle placeholder selection
          document.querySelectorAll('.placeholder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const target = e.currentTarget as HTMLElement;
              const value = target.getAttribute('data-value');
              resolve(value);
              document.body.removeChild(linkTypeDialog);
            });
          });
          
          // Handle cancel
          document.getElementById('cancel-link-btn')?.addEventListener('click', () => {
            resolve(null);
            document.body.removeChild(linkTypeDialog);
          });
          
          // Handle clicking outside to cancel
          linkTypeDialog.addEventListener('click', (e) => {
            if (e.target === linkTypeDialog) {
              resolve(null);
              document.body.removeChild(linkTypeDialog);
            }
          });
        });
        
        // Wait for user selection
        const selectedUrl = await linkSelectionPromise;
        if (!selectedUrl) return; // User cancelled
        
        // If there's selected text, use it as link text
        if (cleanText.trim()) {
          // Check if text looks like a URL
          const isUrlLike = /^https?:\/\/\S+$/i.test(cleanText.trim());
          
          if (isUrlLike && cleanText.trim() === selectedUrl) {
            // If selected text is the same as the URL, just use URL as both text and link
            formattedText = `[${selectedUrl}](${selectedUrl})`;
          } else {
            // Use selected text as link text
            formattedText = `[${cleanText}](${selectedUrl})`;
          }
        } else {
          // No selection or empty selection, use URL as both text and link
          formattedText = `[${selectedUrl}](${selectedUrl})`;
        }
        break;
      case 'normal':
        // Just insert the text as is, already cleaned
        formattedText = cleanText;
        break;
      case 'separator':
        formattedText = '\n---\n';
        break;
      default:
        return;
    }
    
    // Replace the selected text with the formatted text
    document.execCommand('insertText', false, formattedText);
    
    // Trigger content update
    handleContentChange();
  };

  const addEmoji = (emoji: string) => {
    if (!editorRef.current) return;
    
    document.execCommand('insertText', false, emoji);
    setShowEmojiPicker(false);
    
    // Trigger content update
    handleContentChange();
  };

  const addPlaceholder = (placeholder: string) => {
    if (!editorRef.current) return;
    
    document.execCommand('insertText', false, placeholder);
    setShowPlaceholderPicker(false);
    
    // Trigger content update
    handleContentChange();
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerText = '';
      setContent('');
      
      if (onChange) {
        onChange('', '');
      }
    }
  };

  const handleContentChange = () => {
    if (!editorRef.current) return;
    
    const text = editorRef.current.innerText;
    setContent(text);
    
    // Re-check formatting on content change
    checkFormatting();
    
    if (onChange) {
      onChange(renderPreview(text), text);
    }
  };

  // Function to render preview with placeholders
  const renderPreview = (text: string): string => {
    if (!text) return '';
    
    let parsedText = text;
    
    // Replace placeholders with actual values for preview
    placeholders.forEach(placeholder => {
      // Create a regex that handles the placeholder in various contexts
      const placeholderRegex = new RegExp(
        placeholder.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
        'g'
      );
      
      // Replace with a styled code element containing the actual URL
      parsedText = parsedText.replace(
        placeholderRegex,
        `<code class="example-placeholder" title="Placeholder: ${placeholder.name}">${placeholder.value}</code>`
      );
    });
    
    // First, add line breaks to ensure headings and horizontal rules can be properly recognized
    parsedText = parsedText
      // Ensure each line is properly terminated
      .replace(/\n*$/g, '\n\n')
      // Then normalize newlines
      .replace(/\n{3,}/g, '\n\n')
      // Handle special cases with emojis before headings
      .replace(/([^\n])(##\s.*$)/gm, '$1\n$2')
      .replace(/([^\n])(#\s.*$)/gm, '$1\n$2');
    
    // Handle special format for emoji + heading combinations like "💧7️⃣ ## **Drupal 7**"
    parsedText = parsedText.replace(/([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+)\s*##\s*(\*\*.*?\*\*)/gmu, (match, emojis, headingText) => {
      // Create a special heading with emojis preserved
      return `<div class="flex items-center gap-2 my-3"><span class="text-xl">${emojis}</span><h2 class="m-0 text-lg font-bold">${headingText.replace(/\*\*/g, '')}</h2></div>`;
    });
    
    // Handle special link format with arrow
    parsedText = parsedText
      .replace(/([^\n]+?)\s→\s\[(.*?)\]\((.*?)\)/g, (match, text, linkText, url) => {
        return `${text} <span class="arrow">→</span> <a href="${url}" class="text-blue-600 underline">${linkText}</a>`;
      });
    
    // Parse markdown elements - ensuring proper matching of block elements
    parsedText = parsedText
      // Headers - must start at beginning of line
      .replace(/^#\s+(.*?)$/gm, '<h1 class="text-xl font-bold my-2">$1</h1>')
      .replace(/^##\s+(.*?)$/gm, '<h2 class="text-lg font-bold my-2">$1</h2>')
      .replace(/^###\s+(.*?)$/gm, '<h3 class="text-base font-bold my-2">$1</h3>')
      
      // Bold, italic, underline - Standard Markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // ** for bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')             // * for italic
      .replace(/_(.*?)_/g, '<u>$1</u>')                 // _ for underline
      
      // Regular links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      
      // Lists - Standard Markdown uses - for lists
      .replace(/^-\s+(.*?)$/gm, '<li class="ml-5 list-disc">$1</li>')
      
      // Arrow symbol that's not already in a span
      .replace(/([^>])→([^<])/g, '$1<span class="arrow">→</span>$2')
      
      // Paragraphs - ensure proper spacing
      .replace(/\n\n/g, '<p class="mb-3"></p>')
      
      // Horizontal rule - Standard Markdown uses 3 dashes
      .replace(/^---$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-600" />');
    
    // Wrap emoji sequences at the beginning of lines to make them more visible
    parsedText = parsedText.replace(/^([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+\s*[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]*)/gmu, '<span class="text-xl">$1</span>');
    
    return parsedText;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert(t('common.markdownCopied'));
  };

  // Add useRef for the dropdown element
  const placeholderDropdownRef = useRef<HTMLDivElement>(null);

  // Add useEffect for handling clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        placeholderDropdownRef.current && 
        !placeholderDropdownRef.current.contains(event.target as Node) &&
        showPlaceholderPicker
      ) {
        setShowPlaceholderPicker(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showPlaceholderPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlaceholderPicker]);

  // Do the same for the emoji picker
  const emojiDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiDropdownRef.current && 
        !emojiDropdownRef.current.contains(event.target as Node) &&
        showEmojiPicker
      ) {
        setShowEmojiPicker(false);
      }
    }
    
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Function to check text formatting in the current selection
  const checkFormatting = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveFormats(new Set());
      return;
    }
    
    const selectedText = selection.toString();
    const activeFormatSet = new Set<string>();
    
    // Check for bold formatting (**text**)
    if (/^\*\*.*\*\*$/.test(selectedText.trim())) {
      activeFormatSet.add('bold');
    }
    
    // Check for italic formatting (*text*)
    // Make sure it's not part of bold text
    if (/^\*[^*].*[^*]\*$/.test(selectedText.trim()) && !activeFormatSet.has('bold')) {
      activeFormatSet.add('italic');
    }
    
    // Check for underline formatting (_text_)
    if (/^_.*?_$/.test(selectedText.trim())) {
      activeFormatSet.add('underline');
    }
    
    // Check for heading 1 (# text)
    if (/^#\s+/.test(selectedText.trim())) {
      activeFormatSet.add('h1');
    }
    
    // Check for heading 2 (## text)
    if (/^##\s+/.test(selectedText.trim())) {
      activeFormatSet.add('h2');
    }
    
    // Check for emoji + heading 2 combinations
    const emojiHeadingMatch = selectedText.match(/([\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}]+\s*)(##\s+)/u);
    if (emojiHeadingMatch) {
      activeFormatSet.add('h2');
    }
    
    // Check for link formatting ([text](url))
    if (/^\[.*?\]\(.*?\)$/.test(selectedText.trim())) {
      activeFormatSet.add('link');
    }
    
    // Check for special arrow links (text → [text](url))
    if (/^.+→\s*\[.*?\]\(.*?\)$/.test(selectedText.trim())) {
      activeFormatSet.add('link');
    }
    
    setActiveFormats(activeFormatSet);
  };

  // Update the checkFormatting function to be called on selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      checkFormatting();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Update the editor's onMouseUp event to also check formatting
  const handleEditorMouseUp = () => {
    checkFormatting();
  };

  return (
    <div className={`markdown-editor ${className}`}>     
      {/* Toolbar */}
      <div className="toolbar p-2 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-md">
        {/* Text formatting group */}
        <div className="flex items-center rounded bg-white dark:bg-gray-700 shadow-sm">
          <button
            type="button"
            onClick={() => applyFormat('bold').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('bold') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } rounded-l border-r border-gray-200 dark:border-gray-600`}
            title={t('editor.bold', 'Bold')}
            aria-label={t('editor.bold', 'Bold')}
          >
            <span className="font-bold">B</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('italic') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } border-r border-gray-200 dark:border-gray-600`}
            title={t('editor.italic', 'Italic')}
            aria-label={t('editor.italic', 'Italic')}
          >
            <span className="italic">I</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('underline') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } border-r border-gray-200 dark:border-gray-600`}
            title={t('editor.underline', 'Underline')}
            aria-label={t('editor.underline', 'Underline')}
          >
            <span className="underline">U</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat('normal').catch(err => console.error('Error applying format:', err))}
            className="p-2 w-10 h-10 flex items-center justify-center rounded-r hover:bg-gray-100 dark:hover:bg-gray-600"
            title={t('editor.normal', 'Clear formatting')}
            aria-label={t('editor.normal', 'Clear formatting')}
          >
            <span className="text-gray-500">Aa</span>
          </button>
        </div>

        {/* Heading group */}
        <div className="flex items-center rounded bg-white dark:bg-gray-700 shadow-sm">
          <button
            type="button"
            onClick={() => applyFormat('h1').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('h1') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } rounded-l border-r border-gray-200 dark:border-gray-600`}
            title={t('editor.heading1', 'Heading 1')}
            aria-label={t('editor.heading1', 'Heading 1')}
          >
            <span className="font-bold text-lg">H1</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat('h2').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('h2') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } rounded-r`}
            title={t('editor.heading2', 'Heading 2')}
            aria-label={t('editor.heading2', 'Heading 2')}
          >
            <span className="font-bold">H2</span>
          </button>
        </div>

        {/* Insertions group */}
        <div className="flex items-center rounded bg-white dark:bg-gray-700 shadow-sm">
          <button
            type="button"
            onClick={() => applyFormat('link').catch(err => console.error('Error applying format:', err))}
            className={`p-2 w-10 h-10 flex items-center justify-center ${
              activeFormats.has('link') 
                ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
            } rounded-l border-r border-gray-200 dark:border-gray-600`}
            title={t('editor.link', 'Insert link')}
            aria-label={t('editor.link', 'Insert link')}
          >
            <span className="text-blue-600 dark:text-blue-400">🔗</span>
          </button>
          <button
            type="button"
            onClick={() => applyFormat('separator').catch(err => console.error('Error applying format:', err))}
            className="p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-200 dark:border-gray-600"
            title={t('editor.separator', 'Insert separator')}
            aria-label={t('editor.separator', 'Insert separator')}
          >
            <span className="text-gray-600 dark:text-gray-300">―</span>
          </button>
          
          {/* Emoji Picker */}
          <div className="relative border-r border-gray-200 dark:border-gray-600">
            <button 
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowPlaceholderPicker(false);
              }}
              className={`p-2 w-10 h-10 flex items-center justify-center ${
                activeFormats.has('emoji') 
                  ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title={t('editor.addEmoji', 'Insert emoji')}
              aria-label={t('editor.addEmoji', 'Insert emoji')}
            >
              😀
            </button>
            {showEmojiPicker && (
              <div 
                ref={emojiDropdownRef}
                className="absolute z-10 top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-lg grid grid-cols-5 gap-2 min-w-[200px]"
              >
                {emojis.map((emoji, index) => (
                  <button 
                    key={index} 
                    onClick={() => addEmoji(emoji)}
                    className="text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-8 h-8 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Placeholder Picker */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => {
                setShowPlaceholderPicker(!showPlaceholderPicker);
                setShowEmojiPicker(false);
              }}
              className={`p-2 w-10 h-10 flex items-center justify-center ${
                activeFormats.has('placeholder') 
                  ? 'bg-gray-200 dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              } rounded-r`}
              title={t('editor.addPlaceholder', 'Insert placeholder')}
              aria-label={t('editor.addPlaceholder', 'Insert placeholder')}
            >
              <span className="font-mono text-xs">{'{...}'}</span>
            </button>
            {showPlaceholderPicker && (
              <div 
                ref={placeholderDropdownRef}
                className="absolute z-10 top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-72 overflow-hidden flex flex-col max-h-96"
              >
                {/* Fixed Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 z-20">
                  <h4 className="text-sm font-medium flex items-center">
                    <span className="text-blue-600 dark:text-blue-400 mr-1">{'{...}'}</span>
                    {t('editor.placeholders', 'Placeholders')}
                  </h4>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-3 overflow-y-auto flex-grow">
                  <div className="space-y-2">
                    {placeholders.map((placeholder, index) => (
                      <button 
                        key={index} 
                        onClick={() => addPlaceholder(placeholder.name)}
                        className="w-full text-left p-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {placeholder.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all font-mono">
                            {placeholder.value}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Fixed Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 z-20">
                  {t('editor.placeholderHelp', 'Click a placeholder to insert it into your text')}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-grow"></div>
        
        {/* Actions group */}
        <button 
          type="button"
          onClick={clearEditor} 
          className="px-3 h-10 flex items-center bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors shadow-sm"
          title={t('editor.clear', 'Clear editor content')}
          aria-label={t('editor.clear', 'Clear editor content')}
        >
          {t('editor.clear', 'Clear')}
        </button>
      </div>
      
      {/* Editor Area - Using contentEditable div */}
      <div className="border border-t-0 border-gray-200 dark:border-gray-700">
        <div
          ref={editorRef}
          contentEditable={true}
          className="editor-content p-3 min-h-[150px] bg-white dark:bg-gray-700 outline-none whitespace-pre-wrap"
          onInput={handleContentChange}
          onMouseUp={handleEditorMouseUp}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        ></div>
      </div>
      
      {/* Placeholder Guide */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>{t('editor.supportedPlaceholders')}: 
          {placeholders.map((p, i) => (
            <code key={i} className="mx-1 px-1 bg-gray-100 dark:bg-gray-800 rounded font-mono">{p.name}</code>
          ))}
        </p>
      </div>

      {/* Preview section */}
      <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex justify-between items-center">
          <span>{t('common.preview')}:</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 px-2 py-1 text-xs border focus:ring-blue-500 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus:ring-offset-gray-900"
          >
            {t('editor.copyMarkdown')}
          </button>
        </h4>
        <div className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
          <div dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
        </div>
      </div>

      <style>{`
        .editor-content {
          outline: none;
          min-height: 150px;
        }
        .editor-content[data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .editor-content p {
          margin-bottom: 0.75rem;
        }
        .editor-content h1, .editor-content h2, .editor-content h3 {
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          font-weight: bold;
        }
        .editor-content h1 {
          font-size: 1.25rem;
        }
        .editor-content h2 {
          font-size: 1.125rem;
        }
        .editor-content hr {
          margin: 1rem 0;
          border-color: #e5e7eb;
        }
        .dark .editor-content hr {
          border-color: #4b5563;
        }
        .arrow {
          display: inline-block;
          margin: 0 0.25rem;
          color: #6b7280;
          font-weight: normal;
        }
        .placeholder {
          background-color: #e5f2ff;
          border-radius: 4px;
          padding: 0 4px;
          color: #3b82f6;
          cursor: help;
          font-family: monospace;
        }
        .dark .placeholder {
          background-color: rgba(59, 130, 246, 0.2);
        }
        .example-placeholder {
          background: #f3f4f6;
          color: #2563eb;
          border-radius: 4px;
          padding: 0 4px;
          font-family: monospace;
          font-size: 0.95em;
          word-break: break-all;
        }
        .dark .example-placeholder {
          background: #1e293b;
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
};

export default MarkdownTemplateEditor; 