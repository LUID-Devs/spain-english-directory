import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  Users, 
  Settings, 
  Clock, 
  Zap,
  Archive,
  Search,
  Plus,
  Timer,
  Target,
  LineChart,
  Moon,
  Sun,
  Keyboard,
  Inbox,
  Plug,
  Link2,
  ExternalLink
} from 'lucide-react';
import { useGlobalStore } from '@/stores/globalStore';
import { useQuickAddTask } from '@/hooks/useQuickAddTask';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { UnifiedSearchResult } from '@/services/unifiedSearchService';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useGlobalStore();
  const { open: openQuickAdd } = useQuickAddTask();
  const { 
    hasConnectedIntegrations,
    connectedIntegrations,
    suggestions,
    fetchSuggestions 
  } = useUnifiedSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showExternalResults, setShowExternalResults] = useState(false);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => setSearchQuery(''));
      setShowExternalResults(false);
    }
  }, [isOpen]);

  // Fetch external search suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2 && hasConnectedIntegrations) {
      const timer = setTimeout(() => {
        fetchSuggestions(searchQuery, 5);
        setShowExternalResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowExternalResults(false);
    }
  }, [searchQuery, fetchSuggestions, hasConnectedIntegrations]);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const allCommands: CommandItem[] = [
    // Actions
    {
      id: 'quick-add',
      title: 'Quick Add Task',
      shortcut: '⇧⌘T',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        openQuickAdd();
        onClose();
      },
      category: 'Actions',
      keywords: ['create', 'new', 'task']
    },
    {
      id: 'toggle-theme',
      title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      shortcut: '⇧⌘L',
      icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => {
        toggleDarkMode();
        onClose();
      },
      category: 'Actions',
      keywords: ['dark', 'light', 'theme', 'mode']
    },
    // Navigation
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      shortcut: 'G D',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => navigateTo('/dashboard'),
      category: 'Navigation',
      keywords: ['home', 'overview']
    },
    {
      id: 'projects',
      title: 'Go to Projects',
      shortcut: 'G P',
      icon: <FolderKanban className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/projects'),
      category: 'Navigation',
      keywords: ['project']
    },
    {
      id: 'tasks',
      title: 'Go to Tasks',
      shortcut: 'G T',
      icon: <ListTodo className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/tasks'),
      category: 'Navigation',
      keywords: ['task', 'todo']
    },
    {
      id: 'triage',
      title: 'Go to Triage',
      shortcut: 'G I',
      icon: <Inbox className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/triage'),
      category: 'Navigation',
      keywords: ['triage', 'inbox', 'review']
    },
    {
      id: 'teams',
      title: 'Go to Teams',
      shortcut: 'G M',
      icon: <Users className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/teams'),
      category: 'Navigation',
      keywords: ['team', 'members', 'users']
    },
    {
      id: 'timeline',
      title: 'Go to Timeline',
      shortcut: 'G L',
      icon: <Clock className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/timeline'),
      category: 'Navigation',
      keywords: ['calendar', 'schedule']
    },
    {
      id: 'mission-control',
      title: 'Go to Mission Control',
      shortcut: 'G C',
      icon: <Zap className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/mission-control'),
      category: 'Navigation',
      keywords: ['ai', 'agents', 'control']
    },
    {
      id: 'archived',
      title: 'Go to Archived Tasks',
      shortcut: 'G A',
      icon: <Archive className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/archived-tasks'),
      category: 'Navigation',
      keywords: ['archive', 'old']
    },
    {
      id: 'settings',
      title: 'Go to Settings',
      shortcut: 'G S',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/settings'),
      category: 'Navigation',
      keywords: ['config', 'preferences']
    },
    {
      id: 'integrations',
      title: 'Go to Integrations',
      shortcut: 'G I',
      icon: <Link2 className="w-4 h-4" />,
      action: () => navigateTo('/dashboard/integrations'),
      category: 'Navigation',
      keywords: ['integrations', 'asana', 'linear', 'jira', 'connect']
    },
    // Priorities
    {
      id: 'priority-urgent',
      title: 'View Urgent Priority Tasks',
      icon: <Target className="w-4 h-4 text-red-500" />,
      action: () => navigateTo('/dashboard/priority/urgent'),
      category: 'Priorities',
      keywords: ['urgent', 'critical', 'high']
    },
    {
      id: 'priority-high',
      title: 'View High Priority Tasks',
      icon: <LineChart className="w-4 h-4 text-orange-500" />,
      action: () => navigateTo('/dashboard/priority/high'),
      category: 'Priorities',
      keywords: ['high', 'important']
    },
    {
      id: 'priority-medium',
      title: 'View Medium Priority Tasks',
      icon: <Timer className="w-4 h-4 text-yellow-500" />,
      action: () => navigateTo('/dashboard/priority/medium'),
      category: 'Priorities',
      keywords: ['medium', 'normal']
    },
    {
      id: 'priority-low',
      title: 'View Low Priority Tasks',
      icon: <Timer className="w-4 h-4 text-blue-500" />,
      action: () => navigateTo('/dashboard/priority/low'),
      category: 'Priorities',
      keywords: ['low', 'minor']
    },
    {
      id: 'priority-backlog',
      title: 'View Backlog Tasks',
      icon: <Archive className="w-4 h-4 text-gray-500" />,
      action: () => navigateTo('/dashboard/priority/backlog'),
      category: 'Priorities',
      keywords: ['backlog', 'later', 'someday']
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-container" onClick={e => e.stopPropagation()}>
        <Command className="command-palette" loop>
          <div className="command-palette-search">
            <Search className="w-5 h-5 text-gray-400" />
            <Command.Input
              placeholder="Type a command or search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="command-palette-input"
              autoFocus
            />
            <kbd className="command-palette-kbd">ESC</kbd>
          </div>
          
          <Command.List className="command-palette-list">
            <Command.Empty className="command-palette-empty">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No results found for "{searchQuery}"</p>
            </Command.Empty>

            {/* Actions */}
            <Command.Group heading="Actions" className="command-palette-group">
              {allCommands
                .filter(cmd => cmd.category === 'Actions')
                .map(cmd => (
                  <Command.Item
                    key={cmd.id}
                    onSelect={cmd.action}
                    className="command-palette-item"
                    keywords={cmd.keywords}
                  >
                    {cmd.icon}
                    <span className="command-palette-item-title">{cmd.title}</span>
                    {cmd.shortcut && (
                      <kbd className="command-palette-shortcut">{cmd.shortcut}</kbd>
                    )}
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="command-palette-group">
              {allCommands
                .filter(cmd => cmd.category === 'Navigation')
                .map(cmd => (
                  <Command.Item
                    key={cmd.id}
                    onSelect={cmd.action}
                    className="command-palette-item"
                    keywords={cmd.keywords}
                  >
                    {cmd.icon}
                    <span className="command-palette-item-title">{cmd.title}</span>
                    {cmd.shortcut && (
                      <kbd className="command-palette-shortcut">{cmd.shortcut}</kbd>
                    )}
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Priorities */}
            <Command.Group heading="Priorities" className="command-palette-group">
              {allCommands
                .filter(cmd => cmd.category === 'Priorities')
                .map(cmd => (
                  <Command.Item
                    key={cmd.id}
                    onSelect={cmd.action}
                    className="command-palette-item"
                    keywords={cmd.keywords}
                  >
                    {cmd.icon}
                    <span className="command-palette-item-title">{cmd.title}</span>
                  </Command.Item>
                ))}
            </Command.Group>

            {/* External Search Results */}
            {showExternalResults && suggestions.length > 0 && (
              <Command.Group heading="External Tasks" className="command-palette-group">
                {suggestions.map((result: UnifiedSearchResult) => (
                  <Command.Item
                    key={result.id}
                    onSelect={() => {
                      window.open(result.url, '_blank');
                      onClose();
                    }}
                    className="command-palette-item"
                  >
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ 
                        backgroundColor: 
                          result.source === 'asana' ? '#F06A6A' : 
                          result.source === 'linear' ? '#5E6AD2' : '#0052CC' 
                      }} 
                    />
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="command-palette-item-title truncate">
                      {result.title}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto flex-shrink-0 uppercase">
                      {result.source}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="command-palette-footer">
            <div className="command-palette-footer-left">
              <Keyboard className="w-3 h-3" />
              <span>Press <kbd>⌘K</kbd> to open from anywhere</span>
            </div>
            <div className="command-palette-footer-right">
              <span><kbd>↑↓</kbd> to navigate</span>
              <span><kbd>↵</kbd> to select</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
