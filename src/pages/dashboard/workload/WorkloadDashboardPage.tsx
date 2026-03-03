import React, { useState, useEffect } from 'react';
import { apiService, TeamWorkloadResponse, WorkloadMember, WorkloadAlert, WorkloadTask } from '@/services/apiService';
import { toast } from 'sonner';
import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  UserX,
  ArrowRightLeft,
  Settings,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { escapeHtml } from '@/lib/escapeHtml';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const WorkloadDashboardPage: React.FC = () => {
  const [workloadData, setWorkloadData] = useState<TeamWorkloadResponse | null>(null);
  const [alerts, setAlerts] = useState<WorkloadAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkloadMember | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<TeamWorkloadResponse['settings'] | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchWorkloadData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [workload, alertsData] = await Promise.all([
        apiService.getTeamWorkload(),
        apiService.getWorkloadAlerts(),
      ]);
      setWorkloadData(workload);
      setAlerts(alertsData.alerts);
    } catch (error) {
      console.error('Error fetching workload data:', error);
      toast.error('Failed to load workload data');
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  useEffect(() => {
    if (workloadData?.settings) {
      setSettingsDraft(workloadData.settings);
    }
  }, [workloadData?.settings]);

  const handleSaveSettings = async () => {
    if (!settingsDraft) return;
    setIsSavingSettings(true);
    try {
      const response = await apiService.updateWorkloadSettings(settingsDraft);
      if (response.success) {
        setWorkloadData((prev) =>
          prev ? { ...prev, settings: response.settings } : prev
        );
        toast.success('Workload settings updated');
      } else {
        toast.error('Failed to update workload settings');
      }
    } catch (error) {
      console.error('Failed to update workload settings:', error);
      toast.error('Failed to update workload settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'red':
        return 'destructive';
      case 'yellow':
        return 'secondary';
      case 'green':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workloadData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-lg font-semibold">Failed to load workload data</h2>
        <Button onClick={() => fetchWorkloadData()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { summary, members, unassigned, settings } = workloadData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Workload Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor team capacity and balance workloads
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchWorkloadData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Workload Settings</DialogTitle>
                <DialogDescription>
                  Configure capacity thresholds and view options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity Metric</label>
                  <Select
                    value={settingsDraft?.capacityMetric ?? settings.capacityMetric}
                    onValueChange={(value) =>
                      setSettingsDraft((prev) =>
                        prev ? { ...prev, capacityMetric: value as TeamWorkloadResponse['settings']['capacityMetric'] } : prev
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task_count">Task Count</SelectItem>
                      <SelectItem value="time_estimate">Time Estimate</SelectItem>
                      <SelectItem value="story_points">Story Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Capacity</label>
                  <Input
                    type="number"
                    min={1}
                    value={settingsDraft?.defaultCapacity ?? settings.defaultCapacity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setSettingsDraft((prev) =>
                        prev ? { ...prev, defaultCapacity: Number.isNaN(value) ? prev.defaultCapacity : value } : prev
                      );
                    }}
                  />
                  <Progress value={settingsDraft?.defaultCapacity ?? settings.defaultCapacity} max={20} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Warning Threshold (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settingsDraft?.warningThreshold ?? settings.warningThreshold}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setSettingsDraft((prev) =>
                        prev ? { ...prev, warningThreshold: Number.isNaN(value) ? prev.warningThreshold : value } : prev
                      );
                    }}
                  />
                  <Progress value={settingsDraft?.warningThreshold ?? settings.warningThreshold} className="bg-yellow-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danger Threshold (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={settingsDraft?.dangerThreshold ?? settings.dangerThreshold}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setSettingsDraft((prev) =>
                        prev ? { ...prev, dangerThreshold: Number.isNaN(value) ? prev.dangerThreshold : value } : prev
                      );
                    }}
                  />
                  <Progress value={settingsDraft?.dangerThreshold ?? settings.dangerThreshold} className="bg-red-200" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Show unassigned tasks</p>
                    <p className="text-xs text-muted-foreground">Include unassigned tasks in the workload view.</p>
                  </div>
                  <Switch
                    checked={settingsDraft?.showUnassigned ?? settings.showUnassigned}
                    onCheckedChange={(checked) =>
                      setSettingsDraft((prev) => (prev ? { ...prev, showUnassigned: checked } : prev))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Show out of office</p>
                    <p className="text-xs text-muted-foreground">Highlight out of office members.</p>
                  </div>
                  <Switch
                    checked={settingsDraft?.showOutOfOffice ?? settings.showOutOfOffice}
                    onCheckedChange={(checked) =>
                      setSettingsDraft((prev) => (prev ? { ...prev, showOutOfOffice: checked } : prev))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSettingsDraft(settings)}>
                    Reset
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overloadedMembers}</div>
            <p className="text-xs text-muted-foreground">Above {settings.dangerThreshold}% capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Office</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.outOfOfficeMembers}</div>
            <p className="text-xs text-muted-foreground">{summary.conflicts} with assigned tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unassigned.count}</div>
            <p className="text-xs text-muted-foreground">Tasks need assignment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members Workload */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Member Workload</CardTitle>
            <CardDescription>
              Current task load and capacity for each team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.memberId}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profilePictureUrl} />
                        <AvatarFallback>{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{member.username}</p>
                          {member.isOutOfOffice && (
                            <Badge variant="outline" className="text-orange-500">
                              OOO
                            </Badge>
                          )}
                          {member.hasConflict && (
                            <Badge variant="destructive" className="text-xs">
                              Conflict
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{escapeHtml(member.email)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-medium">
                            {member.currentLoad} / {member.capacity}
                          </p>
                          <p className="text-xs text-muted-foreground">tasks</p>
                        </div>
                        <div className="w-16">
                          <div className={`h-2 rounded-full ${getStatusColor(member.status)}`} 
                               style={{ width: `${Math.min(member.capacityPercent, 100)}%` }} />
                          <p className={`text-xs mt-1 font-medium ${
                            member.status === 'red' ? 'text-red-600' :
                            member.status === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {member.capacityPercent}%
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status === 'red' ? 'Overloaded' :
                           member.status === 'yellow' ? 'Warning' : 'Normal'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Issues</CardTitle>
            <CardDescription>
              Issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No issues detected</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'danger' ? 'border-red-200 bg-red-50' :
                        alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.severity)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          {alert.outOfOfficeUntil && (
                            <p className="text-xs text-muted-foreground">
                              Until {new Date(alert.outOfOfficeUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Tasks Section */}
      {unassigned.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Tasks</CardTitle>
            <CardDescription>
              {unassigned.count} task{unassigned.count !== 1 ? 's' : ''} waiting for assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {unassigned.tasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.projectName || 'No project'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedMember?.profilePictureUrl} />
                <AvatarFallback>{selectedMember?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedMember?.username}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {escapeHtml(selectedMember?.email)}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedMember?.tasks.length || 0} assigned tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Capacity</p>
                <Progress value={selectedMember?.capacityPercent || 0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMember?.currentLoad} of {selectedMember?.capacity} tasks ({selectedMember?.capacityPercent}%)
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(selectedMember?.status || 'green')}>
                {selectedMember?.status === 'red' ? 'Overloaded' :
                 selectedMember?.status === 'yellow' ? 'Warning' : 'Normal'}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-3">Assigned Tasks</p>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {selectedMember?.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.projectName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" title="Reassign task" aria-label="Reassign task">
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkloadDashboardPage;
