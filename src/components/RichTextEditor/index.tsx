import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

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
          levels: [3, 4], // Support h3 and h4 for task descriptions
        },
        codeBlock: false,
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

  return (
    <div className={`rich-text-editor ${className}`}>
      <EditorContent editor={editor} />
      <style>{`
        .rich-text-editor {
          position: relative;
        }

        .rich-text-editor .ProseMirror {
          min-height: 120px;
          padding: 12px;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
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

        /* Dark mode adjustments */
        .dark .rich-text-editor .ProseMirror {
          background: hsl(var(--background));
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
