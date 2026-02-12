import React from 'react';
import { Keyboard, X, Command, Search, Plus, CornerDownLeft, ArrowUp, ArrowDown, LogOut } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }[];
}

const shortcuts: ShortcutSection[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show/hide this help', icon: <Keyboard className="w-4 h-4" /> },
      { keys: ['Esc'], description: 'Close modal / Cancel', icon: <LogOut className="w-4 h-4" /> },
      { keys: ['Cmd/Ctrl', 'K'], description: 'Open Command Palette', icon: <Command className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Task Management',
    shortcuts: [
      { keys: ['C'], description: 'Create new task', icon: <Plus className="w-4 h-4" /> },
      { keys: ['/'], description: 'Focus search box', icon: <Search className="w-4 h-4" /> },
      { keys: ['Cmd/Ctrl', 'Shift', 'T'], description: 'Quick add task modal', icon: <Plus className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['J'], description: 'Navigate to next task', icon: <ArrowDown className="w-4 h-4" /> },
      { keys: ['K'], description: 'Navigate to previous task', icon: <ArrowUp className="w-4 h-4" /> },
      { keys: ['↓'], description: 'Navigate to next task' },
      { keys: ['↑'], description: 'Navigate to previous task' },
      { keys: ['Enter'], description: 'Open selected task', icon: <CornerDownLeft className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Navigation (Goto)',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'T'], description: 'Go to Tasks' },
      { keys: ['G', 'M'], description: 'Go to Teams' },
      { keys: ['G', 'S'], description: 'Go to Settings' },
      { keys: ['G', 'C'], description: 'Go to Mission Control' },
    ],
  },
];

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl mx-4 bg-background rounded-xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> anytime to show this help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        {shortcut.icon && <span className="text-muted-foreground">{shortcut.icon}</span>}
                        <span>{shortcut.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <kbd className="px-2 py-1 text-xs font-medium bg-muted border border-border rounded-md min-w-[24px] text-center">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Pro tip: Shortcuts work from anywhere in the dashboard</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
