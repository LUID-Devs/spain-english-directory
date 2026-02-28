import React, { useState, useEffect, useRef } from 'react';
import { X, Command, Search, Calendar, User, Tag, Filter, ArrowUpDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSyntaxHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OperatorExample {
  operator: string;
  description: string;
  examples: string[];
}

const operators: OperatorExample[] = [
  {
    operator: 'is',
    description: 'Filter by status',
    examples: ['is:done', 'is:open', 'is:in-progress', 'is:review', 'is:archived'],
  },
  {
    operator: 'status',
    description: 'Filter by specific status',
    examples: ['status:Completed', 'status:"Work In Progress"'],
  },
  {
    operator: 'priority',
    description: 'Filter by priority level',
    examples: ['priority:urgent', 'priority:high', 'priority:medium', 'priority:low'],
  },
  {
    operator: 'assignee',
    description: 'Filter by assignee',
    examples: ['assignee:me', 'assignee:john', 'assignee:42'],
  },
  {
    operator: 'author',
    description: 'Filter by task creator',
    examples: ['author:me', 'author:sarah'],
  },
  {
    operator: 'project',
    description: 'Filter by project',
    examples: ['project:frontend', 'project:"Mobile App"'],
  },
  {
    operator: 'label',
    description: 'Filter by label/tag',
    examples: ['label:bug', 'label:feature', 'label:"help wanted"'],
  },
  {
    operator: 'due',
    description: 'Filter by due date',
    examples: ['due:today', 'due:this-week', 'due:overdue', 'due:next-week'],
  },
  {
    operator: 'created',
    description: 'Filter by creation date',
    examples: ['created:today', 'created:this-week', 'created:last-month'],
  },
  {
    operator: 'updated',
    description: 'Filter by last update',
    examples: ['updated:today', 'updated:this-week'],
  },
  {
    operator: 'sort',
    description: 'Sort results',
    examples: ['sort:priority', 'sort:due-desc', 'sort:created', 'sort:title'],
  },
];

const dateValues = [
  { value: 'today', description: 'Today' },
  { value: 'yesterday', description: 'Yesterday' },
  { value: 'this-week', description: 'Current week (Sun-Sat)' },
  { value: 'next-week', description: 'Next week' },
  { value: 'last-week', description: 'Previous week' },
  { value: 'this-month', description: 'Current month' },
  { value: 'last-month', description: 'Previous month' },
  { value: 'overdue', description: 'Past due date (for due: only)' },
];

const sortFields = [
  { field: 'priority', description: 'By priority (Urgent → Backlog)' },
  { field: 'due', description: 'By due date (earliest first)' },
  { field: 'created', description: 'By creation date (oldest first)' },
  { field: 'updated', description: 'By last update (oldest first)' },
  { field: 'title', description: 'Alphabetically by title' },
  { field: 'status', description: 'By status (To Do → Completed)' },
];

const complexExamples = [
  {
    query: 'is:open assignee:me priority:high',
    description: 'High priority open tasks assigned to me',
  },
  {
    query: '(status:"Work In Progress" OR status:"To Do") AND priority:high',
    description: 'High priority tasks that are open or in progress',
  },
  {
    query: 'project:frontend due:this-week',
    description: 'Frontend tasks due this week',
  },
  {
    query: 'label:bug is:open sort:priority-desc',
    description: 'Open bugs sorted by priority (highest first)',
  },
  {
    query: 'author:me is:done created:last-week',
    description: 'Tasks I completed last week',
  },
  {
    query: 'not:archived due:overdue',
    description: 'Overdue tasks that are not archived',
  },
  {
    query: 'assignee:me -priority:low',
    description: 'My tasks except low priority ones',
  },
];

const SearchSyntaxHelp: React.FC<SearchSyntaxHelpProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'operators' | 'dates' | 'sort' | 'examples'>('operators');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const tabs = [
    { id: 'operators', label: 'Operators', icon: Filter },
    { id: 'dates', label: 'Dates', icon: Calendar },
    { id: 'sort', label: 'Sorting', icon: ArrowUpDown },
    { id: 'examples', label: 'Examples', icon: Search },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 sm:inset-10 md:inset-20 lg:inset-auto lg:top-20 lg:left-1/2 lg:-translate-x-1/2 lg:w-[800px] lg:max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Command className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Search Syntax Guide</h2>
                  <p className="text-sm text-muted-foreground">
                    Use operators to build powerful search queries
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Keyboard Shortcut Tip */}
            <div className="px-6 py-2 bg-primary/5 border-b border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="px-2 py-0.5 bg-background border rounded text-xs font-mono">/</span>
                to focus search
                <span className="px-2 py-0.5 bg-background border rounded text-xs font-mono">?</span>
                to show this guide
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'operators' && (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {operators.map((op) => (
                      <div
                        key={op.operator}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono text-primary">
                              {op.operator}:
                            </code>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {op.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {op.examples.map((example) => (
                            <button
                              key={example}
                              onClick={() => copyToClipboard(example)}
                              className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors font-mono"
                              title="Click to copy"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Negation Section */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <h3 className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-400">
                      <HelpCircle className="h-4 w-4" />
                      Negation
                    </h3>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                      Use <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">-</code> or{' '}
                      <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded">not:</code> to exclude results:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <code className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
                        -priority:low
                      </code>
                      <code className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
                        not:archived
                      </code>
                      <code className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
                        assignee:me -is:done
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'dates' && (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {dateValues.map((dv) => (
                      <div
                        key={dv.value}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <code className="text-sm font-mono text-primary">{dv.value}</code>
                          <p className="text-sm text-muted-foreground">{dv.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Operators
                    </h3>
                    <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                      Use <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">due:</code>,{' '}
                      <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">created:</code>, or{' '}
                      <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">updated:</code> with date values:
                    </p>
                    <div className="mt-3 space-y-2">
                      <code className="block px-3 py-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm font-mono">
                        due:today
                      </code>
                      <code className="block px-3 py-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm font-mono">
                        created:this-week
                      </code>
                      <code className="block px-3 py-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm font-mono">
                        due:overdue
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sort' && (
                <div className="space-y-6">
                  <div className="grid gap-3">
                    {sortFields.map((sf) => (
                      <div
                        key={sf.field}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <code className="text-sm font-mono text-primary">{sf.field}</code>
                          <p className="text-sm text-muted-foreground">{sf.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(`sort:${sf.field}`)}
                            className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors font-mono"
                          >
                            sort:{sf.field}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`sort:${sf.field}-desc`)}
                            className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors font-mono"
                          >
                            sort:{sf.field}-desc
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                    <h3 className="font-medium text-green-900 dark:text-green-400 flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Sort Direction
                    </h3>
                    <p className="mt-2 text-sm text-green-800 dark:text-green-300">
                      Add <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/40 rounded">-desc</code> for descending order.
                      Default is ascending.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click any example to copy it to your clipboard:
                  </p>
                  {complexExamples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => copyToClipboard(ex.query)}
                      className="w-full text-left p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all group"
                    >
                      <code className="block text-sm font-mono text-primary mb-2 group-hover:text-primary">
                        {ex.query}
                      </code>
                      <p className="text-sm text-muted-foreground">{ex.description}</p>
                    </button>
                  ))}

                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                    <h3 className="font-medium text-purple-900 dark:text-purple-400 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Special Values
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-purple-800 dark:text-purple-300">
                      <li>
                        <code className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded">me</code> — Refers to the current user in assignee: and author:
                      </li>
                      <li>
                        <code className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/40 rounded">overdue</code> — Only works with due: operator
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/50 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Pro tip: Combine multiple operators for precise filtering
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchSyntaxHelp;
