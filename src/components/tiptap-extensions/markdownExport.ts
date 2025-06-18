// Dummy empty export to satisfy any potential import references
// This is a placeholder file to replace the deleted markdownExport.ts

import { Extension } from '@tiptap/core'

/**
 * This is a placeholder extension to replace the deleted markdownExport.ts file.
 * It doesn't actually do anything - HTML to Markdown conversion is now handled
 * directly in the MarkdownTemplateEditor component.
 */
export const MarkdownExport = Extension.create({
  name: 'markdownExport',
  
  addStorage() {
    return {
      getMarkdown: () => '',
    }
  },
})

export default MarkdownExport 