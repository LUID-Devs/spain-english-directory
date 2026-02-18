import React, { useState, useCallback, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  CheckCircle2,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { AsanaLink, AsanaSyncConfig } from '@/services/asanaService';
import { useAsanaIntegration } from '@/hooks/useAsana';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

interface AsanaLinkPanelProps {
  taskId: number;
  taskTitle: string;
  taskDescription?: string;
  taskStatus?: string;
  taskPriority?: string;
  taskDueDate?: string;
}

const syncDirectionConfig = {
  to_asana: { label: 'To Asana', icon: <ArrowRight className="h-3 w-3" />, color: 'bg-blue-100 text-blue-700' },
  from_asana: { label: 'From Asana', icon: <ArrowLeft className="h-3 w-3" />, color: 'bg-green-100 text-green-700' },
  bidirectional: { label: 'Two-way', icon: <ArrowRightLeft className="h-3 w-3" />, color: 'bg-purple-100 text-purple-700' },
};

const AsanaLinkPanel: React.FC<AsanaLinkPanelProps> = ({
  taskId,
  taskTitle,
  taskDescription,
  taskStatus,
  taskPriority,
  taskDueDate,
}) => {
  const {
    isConnected,
    isLoading,
    taskLinks,
    workspaces,
    projects,
    fetchTaskLinks,
    fetchWorkspaces,
    fetchProjects,
    linkTask,
    createAndLink,
    unlink,
    syncToAsana,
    syncFromAsana,
  } = useAsanaIntegration();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [syncDirection, setSyncDirection] = useState<AsanaSyncConfig['syncDirection']>('bidirectional');

  // Load task links on mount
  useEffect(() => {
    fetchTaskLinks(taskId);
  }, [taskId, fetchTaskLinks]);

  // Load workspaces when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && isConnected) {
      fetchWorkspaces();
    }
  }, [isCreateDialogOpen, isConnected, fetchWorkspaces]);

  // Load projects when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      fetchProjects(selectedWorkspace);
    }
  }, [selectedWorkspace, fetchProjects]);

  const handleCreateLink = useCallback(async () => {
    if (!selectedWorkspace) return;
    
    const config: AsanaSyncConfig = {
      workspaceId: selectedWorkspace,
      projectId: selectedProject || undefined,
      syncDirection,
      fieldMappings: {
        title: true,
        description: true,
        status: true,
        dueDate: true,
        assignee: false,
        priority: true,
      },
    };

    const success = await createAndLink(taskId, config);
    if (success) {
      setIsCreateDialogOpen(false);
      setSelectedWorkspace('');
      setSelectedProject('');
    }
  }, [taskId, selectedWorkspace, selectedProject, syncDirection, createAndLink]);

  const handleSyncToAsana = useCallback(async (linkId: number) => {
    await syncToAsana(taskId, linkId);
    await fetchTaskLinks(taskId);
  }, [taskId, syncToAsana, fetchTaskLinks]);

  const handleSyncFromAsana = useCallback(async (linkId: number) => {
    await syncFromAsana(taskId, linkId);
    await fetchTaskLinks(taskId);
  }, [taskId, syncFromAsana, fetchTaskLinks]);

  const handleUnlink = useCallback(async (linkId: number) => {
    await unlink(linkId);
  }, [unlink]);

  if (!isConnected) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span>Asana integration not connected.</span>
        </div>
        <span className="text-muted-foreground/70">
          Go to Settings → Integrations to connect your Asana account.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Link2 className="h-3 w-3" />
          Asana Sync ({taskLinks.length})
        </h4>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
              <Plus className="h-3 w-3" />
              Link to Asana
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">Link to Asana</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Workspace</label>
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.gid} value={ws.gid} className="text-xs">
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWorkspace && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Project (optional)</label>
                  <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value === '__none__' ? '' : value)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="text-xs">No specific project</SelectItem>
                      {projects.map((proj) => (
                        <SelectItem key={proj.gid} value={proj.gid} className="text-xs">
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium">Sync Direction</label>
                <Select value={syncDirection} onValueChange={(v) => setSyncDirection(v as AsanaSyncConfig['syncDirection'])}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bidirectional" className="text-xs">
                      <span className="flex items-center gap-2">
                        <ArrowRightLeft className="h-3 w-3" />
                        Two-way sync
                      </span>
                    </SelectItem>
                    <SelectItem value="to_asana" className="text-xs">
                      <span className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        TaskLuid → Asana only
                      </span>
                    </SelectItem>
                    <SelectItem value="from_asana" className="text-xs">
                      <span className="flex items-center gap-2">
                        <ArrowLeft className="h-3 w-3" />
                        Asana → TaskLuid only
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">What will be synced:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Task title and description</li>
                  <li>Status and priority</li>
                  <li>Due date</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateLink}
                disabled={!selectedWorkspace || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create & Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {taskLinks.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">
            No Asana links yet.
            <br />
            <span className="text-muted-foreground/70">
              Link this task to Asana to enable sync.
            </span>
          </div>
        ) : (
          taskLinks.map((link) => {
            const direction = syncDirectionConfig[link.syncDirection];
            const isSyncEnabled = link.syncEnabled;

            return (
              <div
                key={link.id}
                className="rounded-md border border-border/50 bg-muted/30 p-2 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Link2 className="h-3.5 w-3.5 text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground truncate">
                        {link.asanaTaskName}
                      </span>
                      
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1 py-0 h-4 gap-0.5 ${direction.color}`}
                      >
                        {direction.icon}
                        {direction.label}
                      </Badge>

                      {isSyncEnabled ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 gap-0.5 bg-green-100 text-green-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 gap-0.5 bg-gray-100 text-gray-600"
                        >
                          Paused
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      {link.asanaProjectName && (
                        <>
                          <span>{link.asanaProjectName}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{link.asanaWorkspaceName || 'Asana'}</span>
                      {link.lastSyncedAt && (
                        <>
                          <span>•</span>
                          <span>Synced {formatDistanceToNow(new Date(link.lastSyncedAt))}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {link.asanaPermalink && (
                      <a
                        href={link.asanaPermalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-muted rounded"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUnlink(link.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Sync Actions */}
                {isSyncEnabled && (
                  <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                    {(link.syncDirection === 'to_asana' || link.syncDirection === 'bidirectional') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => handleSyncToAsana(link.id)}
                        disabled={isLoading}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Push
                      </Button>
                    )}
                    {(link.syncDirection === 'from_asana' || link.syncDirection === 'bidirectional') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={() => handleSyncFromAsana(link.id)}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Pull
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AsanaLinkPanel;
