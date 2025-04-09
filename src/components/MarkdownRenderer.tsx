import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  markdownText: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownText, className = '' }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

  useEffect(() => {
    // Configure marked options for GitHub Flavored Markdown
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false, // Avoid ID conflicts in extension context
      mangle: false,    // Don't mangle header IDs
    });

    const renderMarkdown = async () => {
      try {
        // Convert markdown to HTML
        const html = marked.parse(markdownText) as string;
        
        // Create a new DOMParser to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Manual sanitization of the DOM
        // Remove potentially dangerous elements and attributes
        const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'];
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'javascript:'];
        
        // Remove dangerous tags
        dangerousTags.forEach(tag => {
          const elements = doc.querySelectorAll(tag);
          elements.forEach(el => el.remove());
        });
        
        // Remove dangerous attributes from all elements
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes[i];
            if (dangerousAttrs.some(da => attr.name.includes(da) || (attr.value && attr.value.includes(da)))) {
              el.removeAttribute(attr.name);
              i--; // Adjust index since we removed an attribute
            }
          }
          
          // Ensure all links open in new tab and have proper security attributes
          if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          }
        });
        
        // Get the sanitized body HTML
        const sanitized = doc.body.innerHTML;
        setSanitizedHtml(sanitized);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setSanitizedHtml(`<p>Error rendering markdown</p>`);
      }
    };

    renderMarkdown();
  }, [markdownText]);

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default MarkdownRenderer;

// Example usage:
// <MarkdownRenderer markdownText="# Hello World\nThis is **bold** and this is *italic*." />