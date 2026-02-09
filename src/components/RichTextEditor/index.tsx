import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { Extension } from '@tiptap/core';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, 
  Heading1, Heading2, Heading3, Quote, Code, Code2, Undo, Redo, 
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, SeparatorHorizontal, 
  Highlighter
} from 'lucide-react';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Custom keyboard shortcuts extension
const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',
  addKeyboardShortcuts() {
    return {
      // Bold: Ctrl/Cmd + B
      'Mod-b': () => this.editor.commands.toggleBold(),
      // Italic: Ctrl/Cmd + I
      'Mod-i': () => this.editor.commands.toggleItalic(),
      // Underline: Ctrl/Cmd + U
      'Mod-u': () => this.editor.commands.toggleUnderline(),
      // Heading 1: Ctrl/Cmd + Alt + 1
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      // Heading 2: Ctrl/Cmd + Alt + 2
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      // Heading 3: Ctrl/Cmd + Alt + 3
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      // Bullet List: Ctrl/Cmd + Shift + 8
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
      // Ordered List: Ctrl/Cmd + Shift + 7
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
      // Undo: Ctrl/Cmd + Z
      'Mod-z': () => this.editor.commands.undo(),
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      'Mod-Shift-z': () => this.editor.commands.redo(),
      'Mod-y': () => this.editor.commands.redo(),
    };
  },
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Enter description...',
  className = '',
  disabled = false,
}) => {
  // Track if we're programmatically updating to avoid triggering onChange
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3], // Support h1, h2, h3 as per requirements
        },
        codeBlock: false, // Use CodeBlockLowlight instead for syntax highlighting
        strike: false, // Disable default strike from StarterKit, use explicit extension
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rich-text-image',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Strike,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'rich-text-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      KeyboardShortcuts, // Add custom keyboard shortcuts
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Skip if this is a programmatic update
      if (isUpdatingRef.current) return;

      const newContent = editor.getHTML();
      // Only trigger onChange if content actually changed
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        onChange(newContent);
      }
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update content when it changes externally (only if actually different)
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      // Normalize both for comparison (TipTap might format differently)
      const editorContent = editor.getHTML();
      const normalizedContent = content || '';
      const normalizedEditor = editorContent || '';

      // Only update if genuinely different
      if (normalizedContent !== normalizedEditor) {
        isUpdatingRef.current = true;
        lastContentRef.current = content;
        editor.commands.setContent(content);
        // Reset flag after a tick to ensure onUpdate has fired
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    }
  }, [content, editor]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    try {
      const imageUrl = await onImageUpload(file);
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;

      editor
        .chain()
        .focus()
        .setImage({ src: fullUrl })
        .run();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, [editor, onImageUpload]);

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  // Divider component
  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-border mx-1" />
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Formatting Toolbar */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1 p-2 border border-b-0 border-border rounded-t-lg bg-muted/50">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Highlighting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1 (Ctrl+Alt+1)"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (Ctrl+Alt+2)"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3 (Ctrl+Alt+3)"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            title="Bullet List (Ctrl+Shift+8)"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            title="Numbered List (Ctrl+Shift+7)"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Blockquote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={!editor.can().chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Code Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href;
              const url = window.prompt('Enter URL:', previousUrl);
              if (url === null) return;
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
              } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Horizontal Rule */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={!editor.can().chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <SeparatorHorizontal className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />
      <style>{`
        .rich-text-editor {
          position: relative;
        }

        .rich-text-editor .ProseMirror {
          min-height: 120px;
          padding: 12px;
          border: 1px solid hsl(var(--border));
          border-radius: ${disabled ? '8px' : '0 0 8px 8px'};
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .rich-text-editor .ProseMirror:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }

        .rich-text-editor .ProseMirror p {
          margin: 0 0 8px 0;
        }

        .rich-text-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        .rich-text-editor .ProseMirror .rich-text-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          margin: 8px 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .rich-text-editor .ProseMirror .rich-text-image:hover {
          opacity: 0.9;
        }

        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }

        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          padding-left: 24px;
          margin: 8px 0;
        }

        .rich-text-editor .ProseMirror li {
          margin: 4px 0;
        }

        .rich-text-editor .ProseMirror strong {
          font-weight: 600;
        }

        .rich-text-editor .ProseMirror em {
          font-style: italic;
        }

        .rich-text-editor .ProseMirror code {
          background: hsl(var(--muted));
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }

        .rich-text-editor .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 12px;
          margin: 8px 0;
          color: hsl(var(--muted-foreground));
        }

        .rich-text-editor .ProseMirror h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 20px 0 12px 0;
          color: hsl(var(--foreground));
          border-bottom: 2px solid hsl(var(--border));
          padding-bottom: 8px;
        }

        .rich-text-editor .ProseMirror h1:first-child {
          margin-top: 0;
        }

        .rich-text-editor .ProseMirror h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 18px 0 10px 0;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 6px;
        }

        .rich-text-editor .ProseMirror h2:first-child {
          margin-top: 0;
        }

        .rich-text-editor .ProseMirror h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 8px 0;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 4px;
        }

        .rich-text-editor .ProseMirror h3:first-child {
          margin-top: 0;
        }

        .rich-text-editor .ProseMirror h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 12px 0 6px 0;
          color: hsl(var(--foreground));
        }

        .rich-text-editor .ProseMirror h4:first-child {
          margin-top: 0;
        }

        /* Code Block with Syntax Highlighting */
        .rich-text-editor .ProseMirror pre {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
          overflow-x: auto;
          font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
        }

        .rich-text-editor .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: inherit;
          color: inherit;
          border-radius: 0;
        }

        .rich-text-editor .ProseMirror pre .hljs-comment,
        .rich-text-editor .ProseMirror pre .hljs-quote {
          color: #6a737d;
          font-style: italic;
        }

        .rich-text-editor .ProseMirror pre .hljs-keyword,
        .rich-text-editor .ProseMirror pre .hljs-selector-tag,
        .rich-text-editor .ProseMirror pre .hljs-subst {
          color: #d73a49;
          font-weight: bold;
        }

        .rich-text-editor .ProseMirror pre .hljs-string,
        .rich-text-editor .ProseMirror pre .hljs-doctag,
        .rich-text-editor .ProseMirror pre .hljs-regexp {
          color: #032f62;
        }

        .rich-text-editor .ProseMirror pre .hljs-number,
        .rich-text-editor .ProseMirror pre .hljs-literal {
          color: #005cc5;
        }

        .rich-text-editor .ProseMirror pre .hljs-function,
        .rich-text-editor .ProseMirror pre .hljs-class .hljs-title {
          color: #6f42c1;
        }

        .rich-text-editor .ProseMirror pre .hljs-variable,
        .rich-text-editor .ProseMirror pre .hljs-template-variable,
        .rich-text-editor .ProseMirror pre .hljs-tag .hljs-attr {
          color: #e36209;
        }

        /* Highlight styles */
        .rich-text-editor .ProseMirror mark {
          background-color: #fef3c7;
          padding: 2px 4px;
          border-radius: 3px;
          color: inherit;
        }

        .dark .rich-text-editor .ProseMirror mark {
          background-color: rgba(251, 191, 36, 0.3);
        }

        .rich-text-editor .ProseMirror u {
          text-decoration: underline;
        }

        .rich-text-editor .ProseMirror s {
          text-decoration: line-through;
        }

        .rich-text-editor .ProseMirror .rich-text-link {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }

        .rich-text-editor .ProseMirror .rich-text-link:hover {
          color: hsl(var(--primary) / 0.8);
        }

        .rich-text-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid hsl(var(--border));
          margin: 16px 0;
        }

        /* Dark mode adjustments */
        .dark .rich-text-editor .ProseMirror {
          background: hsl(var(--background));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
