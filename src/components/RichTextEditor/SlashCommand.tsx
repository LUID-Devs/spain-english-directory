import { Extension } from '@tiptap/core';
import { PluginKey, Plugin } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import {
  Workflow,
  List,
  BarChart3,
  GitBranch,
  Table,
  PieChart,
  Clock,
  Users,
  Network,
} from 'lucide-react';

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: { editor: any; range: any }) => void;
}

export const slashCommands: SlashCommandItem[] = [
  {
    title: 'Diagram',
    description: 'Insert a Mermaid diagram',
    icon: <Workflow className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertMermaid()
        .run();
    },
  },
  {
    title: 'Flowchart',
    description: 'Insert a flowchart diagram',
    icon: <GitBranch className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
          },
        })
        .run();
    },
  },
  {
    title: 'Sequence Diagram',
    description: 'Insert a sequence diagram',
    icon: <Users className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `sequenceDiagram
    participant A as User
    participant B as API
    participant C as Database
    
    A->>B: Request data
    B->>C: Query
    C-->>B: Results
    B-->>A: Response`,
          },
        })
        .run();
    },
  },
  {
    title: 'Gantt Chart',
    description: 'Insert a Gantt chart',
    icon: <Clock className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :a1, 2024-01-01, 7d
    Design             :a2, after a1, 5d
    section Development
    Implementation     :a3, after a2, 14d
    Testing            :a4, after a3, 7d`,
          },
        })
        .run();
    },
  },
  {
    title: 'ER Diagram',
    description: 'Insert an entity relationship diagram',
    icon: <Table className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `erDiagram
    USER ||--o{ ORDER : places
    USER {
        int id
        string name
        string email
    }
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        int id
        date created_at
        float total
    }
    ORDER_ITEM {
        int id
        string product
        int quantity
    }`,
          },
        })
        .run();
    },
  },
  {
    title: 'Pie Chart',
    description: 'Insert a pie chart',
    icon: <PieChart className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `pie title Distribution
    "Category A" : 40
    "Category B" : 30
    "Category C" : 20
    "Category D" : 10`,
          },
        })
        .run();
    },
  },
  {
    title: 'Mindmap',
    description: 'Insert a mind map',
    icon: <Network className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'mermaid',
          attrs: {
            content: `mindmap
  root((Project))
    Planning
      Research
      Design
      Requirements
    Development
      Frontend
      Backend
      Testing
    Deployment
      CI/CD
      Monitoring`,
          },
        })
        .run();
    },
  },
];

export const SlashCommandPluginKey = new PluginKey('slashCommand');

export interface SlashCommandOptions {
  commands?: SlashCommandItem[];
}

const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      commands: slashCommands,
    };
  },

  addProseMirrorPlugins() {
    const { commands } = this.options;

    return [
      new Plugin({
        key: SlashCommandPluginKey,
        view: () => {
          let renderer: ReactRenderer | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            update: (view, prevState) => {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;
              const textBefore = $from.parent.textBetween(
                Math.max(0, $from.parentOffset - 50),
                $from.parentOffset,
                null,
                '\ufffc'
              );

              const match = textBefore.match(/\/(\w*)$/);

              if (!match) {
                if (popup) {
                  popup[0]?.destroy();
                  popup = null;
                }
                if (renderer) {
                  renderer.destroy();
                  renderer = null;
                }
                return;
              }

              const query = match[1].toLowerCase();
              const filteredCommands = commands?.filter((cmd) =>
                cmd.title.toLowerCase().includes(query) ||
                cmd.description.toLowerCase().includes(query)
              ) || [];

              if (filteredCommands.length === 0) {
                if (popup) {
                  popup[0]?.destroy();
                  popup = null;
                }
                if (renderer) {
                  renderer.destroy();
                  renderer = null;
                }
                return;
              }

              if (!renderer) {
                renderer = new ReactRenderer(SlashCommandList, {
                  props: {
                    items: filteredCommands,
                    command: (item: SlashCommandItem) => {
                      const { state } = view;
                      const { selection } = state;
                      const { $from } = selection;
                      const start = $from.pos - match[0].length;
                      const end = $from.pos;

                      item.command({
                        editor: (this.editor as any),
                        range: { from: start, to: end },
                      });

                      popup?.[0]?.destroy();
                      popup = null;
                      renderer?.destroy();
                      renderer = null;
                    },
                  },
                  editor: this.editor,
                });

                const getReferenceClientRect = () => {
                  const coords = view.coordsAtPos($from.pos);
                  return {
                    width: 0,
                    height: 0,
                    top: coords.top,
                    bottom: coords.bottom,
                    left: coords.left,
                    right: coords.right,
                    x: coords.left,
                    y: coords.top,
                    toJSON: () => ({}),
                  };
                };

                popup = tippy('body', {
                  getReferenceClientRect,
                  appendTo: () => document.body,
                  content: renderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  offset: [0, 8],
                  popperOptions: {
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: document.body,
                        },
                      },
                    ],
                  },
                });
              } else {
                renderer.updateProps({
                  items: filteredCommands,
                });
              }
            },
            destroy: () => {
              popup?.[0]?.destroy();
              renderer?.destroy();
            },
          };
        },
      }),
    ];
  },
});

// Slash Command List Component
import React, { useState, useEffect, useRef } from 'react';

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

const SlashCommandList: React.FC<SlashCommandListProps> = ({ items, command }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset selection when items change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        command(items[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // The popup will be destroyed by the plugin
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, command]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      className="slash-command-list"
      style={{
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        boxShadow: '0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        padding: '4px',
        maxHeight: '320px',
        overflowY: 'auto',
        minWidth: '220px',
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`slash-command-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => command(item)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            background: index === selectedIndex ? 'hsl(var(--muted))' : 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'hsl(var(--foreground))',
                marginBottom: '2px',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlashCommand;
