import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MermaidNodeView from './MermaidNodeView';

export interface MermaidOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      /**
       * Insert a mermaid diagram
       */
      insertMermaid: (options?: { content?: string }) => ReturnType;
      /**
       * Set mermaid diagram content
       */
      setMermaid: (options: { content: string }) => ReturnType;
    };
  }
}

export const MermaidExtension = Node.create<MermaidOptions>({
  name: 'mermaid',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: (element) => {
          // Extract content from the data-content attribute or inner text
          return element.getAttribute('data-content') || element.textContent || '';
        },
        renderHTML: (attributes) => {
          return {
            'data-content': attributes.content,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
      {
        // Parse mermaid code blocks
        tag: 'pre code.language-mermaid',
        getAttrs: (element) => {
          const codeElement = element as HTMLElement;
          return {
            content: codeElement.textContent || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(
      { 'data-type': 'mermaid' },
      this.options.HTMLAttributes,
      HTMLAttributes
    ), HTMLAttributes.content || ''];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNodeView);
  },

  addCommands() {
    return {
      insertMermaid:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              content: options.content || `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`,
            },
          });
        },
      setMermaid:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            content: options.content,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Allow Enter to create new paragraph after mermaid block
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const node = $from.node();
        if (node.type.name === this.name) {
          return editor.commands.exitCode();
        }

        return false;
      },
    };
  },
});

export default MermaidExtension;
