import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import mermaid from 'mermaid';
import { Edit2, Check, X, Maximize2, Minimize2, Copy, CheckCheck } from 'lucide-react';

interface MermaidNodeViewProps {
  node: {
    attrs: {
      content: string;
    };
  };
  updateAttributes: (attrs: { content: string }) => void;
  editor: {
    isEditable: boolean;
  };
  selected: boolean;
}

// Initialize Mermaid with custom configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: true,
  },
  gantt: {
    useMaxWidth: true,
  },
});

const MermaidNodeView: React.FC<MermaidNodeViewProps> = ({
  node,
  updateAttributes,
  editor,
  selected,
}) => {
  const { content } = node.attrs;
  const svgRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Render the mermaid diagram
  const renderDiagram = useCallback(async (diagramContent: string) => {
    if (!diagramContent.trim()) {
      setSvgContent('');
      setError(null);
      return;
    }

    try {
      // Generate a unique ID for this render
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, diagramContent.trim());
      setSvgContent(svg);
      setError(null);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
      setSvgContent('');
    }
  }, []);

  // Render when content changes
  useEffect(() => {
    renderDiagram(content);
  }, [content, renderDiagram]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateAttributes({ content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle keyboard shortcuts in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper
      className={`mermaid-diagram-wrapper ${selected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''}`}
      data-type="mermaid"
    >
      {isEditing ? (
        <div className="mermaid-edit-mode">
          <div className="mermaid-edit-header">
            <span className="mermaid-edit-title">Edit Diagram</span>
            <div className="mermaid-edit-actions">
              <span className="mermaid-shortcut-hint">Ctrl+Enter to save</span>
              <button
                onClick={handleSave}
                className="mermaid-btn mermaid-btn-primary"
                title="Save changes"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="mermaid-btn mermaid-btn-secondary"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mermaid-textarea"
            placeholder="Enter Mermaid diagram syntax..."
            rows={10}
          />
          <div className="mermaid-help-text">
            Supports: Flowcharts, Sequence diagrams, Gantt charts, ER diagrams, and more.
            <a
              href="https://mermaid.js.org/syntax/flowchart.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mermaid-help-link"
            >
              Learn Mermaid syntax
            </a>
          </div>
        </div>
      ) : (
        <div className="mermaid-preview-mode">
          <div className="mermaid-preview-header">
            <div className="mermaid-type-badge">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 6.34L2.1 2.1m17.9 9.9h-6m-6 0H1.9m16.32 4.22l4.24 4.24M6.34 17.66l-4.24 4.24" />
              </svg>
              <span>Diagram</span>
            </div>
            <div className="mermaid-preview-actions">
              <button
                onClick={handleCopyCode}
                className="mermaid-icon-btn"
                title={isCopied ? 'Copied!' : 'Copy diagram code'}
              >
                {isCopied ? (
                  <CheckCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mermaid-icon-btn"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              {isEditable && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mermaid-icon-btn"
                  title="Edit diagram"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div
            className={`mermaid-diagram-container ${isExpanded ? 'mermaid-expanded' : ''}`}
            ref={svgRef}
          >
            {error ? (
              <div className="mermaid-error">
                <div className="mermaid-error-title">Diagram Error</div>
                <div className="mermaid-error-message">{error}</div>
                {isEditable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mermaid-btn mermaid-btn-primary mt-2"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Fix Diagram
                  </button>
                )}
              </div>
            ) : svgContent ? (
              <div
                className="mermaid-svg"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="mermaid-empty">
                <div className="mermaid-empty-icon">📊</div>
                <div>Empty diagram</div>
                {isEditable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mermaid-btn mermaid-btn-primary mt-2"
                  >
                    Add Diagram Content
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .mermaid-diagram-wrapper {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
          background: hsl(var(--background));
          margin: 12px 0;
          transition: box-shadow 0.2s;
        }

        .mermaid-diagram-wrapper.is-selected {
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }

        .mermaid-diagram-wrapper.is-expanded {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 1200px;
          max-height: 90vh;
          z-index: 1000;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .mermaid-edit-mode {
          padding: 16px;
          background: hsl(var(--muted) / 0.5);
        }

        .mermaid-edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .mermaid-edit-title {
          font-weight: 600;
          font-size: 14px;
          color: hsl(var(--foreground));
        }

        .mermaid-edit-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mermaid-shortcut-hint {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }

        .mermaid-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          min-height: 150px;
          outline: none;
        }

        .mermaid-textarea:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }

        .mermaid-help-text {
          margin-top: 8px;
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }

        .mermaid-help-link {
          margin-left: 8px;
          color: hsl(var(--primary));
          text-decoration: underline;
        }

        .mermaid-help-link:hover {
          color: hsl(var(--primary) / 0.8);
        }

        .mermaid-preview-mode {
          background: hsl(var(--background));
        }

        .mermaid-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: hsl(var(--muted) / 0.5);
          border-bottom: 1px solid hsl(var(--border));
        }

        .mermaid-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
        }

        .mermaid-preview-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mermaid-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          border: none;
          background: transparent;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.2s;
        }

        .mermaid-icon-btn:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .mermaid-diagram-container {
          padding: 16px;
          overflow: auto;
          max-height: 400px;
        }

        .mermaid-diagram-container.mermaid-expanded {
          max-height: calc(90vh - 60px);
        }

        .mermaid-svg {
          display: flex;
          justify-content: center;
        }

        .mermaid-svg svg {
          max-width: 100%;
          height: auto;
        }

        .mermaid-error {
          padding: 24px;
          text-align: center;
          color: hsl(var(--destructive));
          background: hsl(var(--destructive) / 0.05);
          border-radius: 6px;
        }

        .mermaid-error-title {
          font-weight: 600;
          margin-bottom: 8px;
        }

        .mermaid-error-message {
          font-size: 13px;
          font-family: monospace;
          opacity: 0.8;
        }

        .mermaid-empty {
          padding: 32px;
          text-align: center;
          color: hsl(var(--muted-foreground));
        }

        .mermaid-empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .mermaid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .mermaid-btn-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .mermaid-btn-primary:hover {
          background: hsl(var(--primary) / 0.9);
        }

        .mermaid-btn-secondary {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .mermaid-btn-secondary:hover {
          background: hsl(var(--muted) / 0.8);
        }

        /* Dark mode adjustments for mermaid */
        .dark .mermaid-svg .node rect,
        .dark .mermaid-svg .node circle,
        .dark .mermaid-svg .node ellipse,
        .dark .mermaid-svg .node polygon {
          fill: hsl(var(--muted)) !important;
          stroke: hsl(var(--border)) !important;
        }

        .dark .mermaid-svg .node .label {
          color: hsl(var(--foreground)) !important;
        }

        .dark .mermaid-svg .edgeLabel {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }

        .dark .mermaid-svg .edge-thickness-normal {
          stroke: hsl(var(--muted-foreground)) !important;
        }

        .dark .mermaid-svg .arrowheadPath {
          fill: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
    </NodeViewWrapper>
  );
};

export default MermaidNodeView;
