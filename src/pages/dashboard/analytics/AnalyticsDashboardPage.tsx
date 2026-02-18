import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/authProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Users, Activity } from 'lucide-react';

interface VelocityData {
  cycleId: number;
  cycleName: string;
  startDate: string;
  endDate: string;
  status: string;
  completedTasks: number;
  totalPoints: number;
  averagePointsPerTask: number;
}

interface VelocityResponse {
  success: boolean;
  teamId: number;
  cyclesAnalyzed: number;
  averageVelocity: {
    tasksPerCycle: number;
    pointsPerCycle: number;
  };
  velocityByCycle: VelocityData[];
}

interface CycleTimeData {
  priority: string;
  count: number;
  averageCycleTime: number;
  min: number;
  max: number;
}

interface CycleTimeResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  tasksAnalyzed: number;
  averageCycleTimeDays: number;
  cycleTimeByPriority: CycleTimeData[];
}

interface ThroughputData {
  period: string;
  completedTasks: number;
  totalPoints: number;
}

interface ThroughputResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  groupBy: string;
  totalTasks: number;
  totalPoints: number;
  averagePerPeriod: number;
  periodsAnalyzed: number;
  throughputData: ThroughputData[];
}

interface StatusTimeData {
  status: string;
  taskCount: number;
  totalHours: number;
  averageHours: number;
  medianHours: number;
  minHours: number;
  maxHours: number;
}

interface StatusTimeResponse {
  success: boolean;
  teamId: number;
  periodDays: number;
  tasksAnalyzed: number;
  statusBreakdown: StatusTimeData[];
}

interface WorkloadUser {
  userId: number;
  username: string;
  taskCount: number;
}

interface SummaryResponse {
  success: boolean;
  team: {
    id: number;
    name: string;
    memberCount: number;
    cyclesEnabled: boolean;
  };
  summary: {
    activeCycle: {
      cycleId: number;
      cycleName: string;
      startDate: string;
      endDate: string;
      totalTasks: number;
      completedTasks: number;
      totalPoints: number;
      completedPoints: number;
    } | null;
    recentThroughput: {
      period: string;
      completedTasks: number;
      averagePerDay: number;
    };
    cycleTime: {
      period: string;
      averageDays: number;
      tasksAnalyzed: number;
    };
    currentWorkload: {
      activeTasks: number;
      byUser: WorkloadUser[];
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function AnalyticsDashboardPage() {
  const { user, getToken, activeOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [velocity, setVelocity] = useState<VelocityResponse | null>(null);
  const [cycleTime, setCycleTime] = useState<CycleTimeResponse | null>(null);
  const [throughput, setThroughput] = useState<ThroughputResponse | null>(null);
  const [statusTime, setStatusTime] = useState<StatusTimeResponse | null>(null);
  const [teamId, setTeamId] = useState<string>('');
  const [cyclesCount, setCyclesCount] = useState<string>('6');
  const [periodDays, setPeriodDays] = useState<string>('30');

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.taskluid.com';

  useEffect(() => {
    if (user?.teamId) {
      setTeamId(user.teamId.toString());
    }
  }, [user]);

  useEffect(() => {
    if (teamId && activeOrganization) {
      fetchAnalytics();
    }
  }, [teamId, activeOrganization, cyclesCount, periodDays]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const orgId = activeOrganization?.id;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const queryParams = orgId ? `?orgId=${orgId}` : '';

      // Fetch all analytics data in parallel
      const [summaryRes, velocityRes, cycleTimeRes, throughputRes, statusTimeRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/teams/${teamId}/summary${queryParams}`, { headers }),
        fetch(`${API_URL}/api/analytics/teams/${teamId}/velocity${queryParams}&cycles=${cyclesCount}`, { headers }),
        fetch(`${API_URL}/api/analytics/teams/${teamId}/cycle-time${queryParams}&period=${periodDays}`, { headers }),
        fetch(`${API_URL}/api/analytics/teams/${teamId}/throughput${queryParams}&period=${periodDays}&groupBy=week`, { headers }),
        fetch(`${API_URL}/api/analytics/teams/${teamId}/status-time${queryParams}&period=${periodDays}`, { headers }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (velocityRes.ok) setVelocity(await velocityRes.json());
      if (cycleTimeRes.ok) setCycleTime(await cycleTimeRes.json());
      if (throughputRes.ok) setThroughput(await throughputRes.json());
      if (statusTimeRes.ok) setStatusTime(await statusTimeRes.json());
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, loading }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    icon: React.ElementType;
    loading: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
          <p className="text-muted-foreground">
            Track velocity, cycle time, and throughput for {summary?.team?.name || 'your team'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={cyclesCount} onValueChange={setCyclesCount}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 cycles</SelectItem>
              <SelectItem value="6">Last 6 cycles</SelectItem>
              <SelectItem value="12">Last 12 cycles</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodDays} onValueChange={setPeriodDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Cycle Time"
          value={cycleTime ? `${cycleTime.averageCycleTimeDays} days` : '-'}
          subtitle={`${cycleTime?.tasksAnalyzed || 0} tasks analyzed`}
          icon={Clock}
          loading={loading}
        />
        <StatCard
          title="Recent Throughput"
          value={summary?.summary?.recentThroughput?.completedTasks || 0}
          subtitle={`${summary?.summary?.recentThroughput?.averagePerDay || 0} tasks/day`}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Active Tasks"
          value={summary?.summary?.currentWorkload?.activeTasks || 0}
          subtitle={`Across ${summary?.team?.memberCount || 0} team members`}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="Current Cycle"
          value={summary?.summary?.activeCycle ? 
            `${Math.round((summary.summary.activeCycle.completedTasks / summary.summary.activeCycle.totalTasks) * 100) || 0}%` 
            : 'No active cycle'}
          subtitle={summary?.summary?.activeCycle ? 
            `${summary.summary.activeCycle.completedTasks}/${summary.summary.activeCycle.totalTasks} tasks` 
            : ''}
          icon={CheckCircle2}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Velocity by Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : velocity?.velocityByCycle?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocity.velocityByCycle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="cycleName" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completedTasks" fill="#0088FE" name="Tasks" />
                  <Bar dataKey="totalPoints" fill="#00C49F" name="Points" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No cycle data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Throughput Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : throughput?.throughputData?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={throughput.throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completedTasks" 
                    stroke="#8884D8" 
                    strokeWidth={2}
                    name="Tasks Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No throughput data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cycle Time by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cycle Time by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : cycleTime?.cycleTimeByPriority?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cycleTime.cycleTimeByPriority} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="priority" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="averageCycleTime" fill="#FF8042" name="Avg Days" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No cycle time data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time in Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time in Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : statusTime?.statusBreakdown?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusTime.statusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}h`} />
                  <YAxis dataKey="status" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value} hrs`, "Avg Hours"]} />
                  <Bar dataKey="averageHours" fill="#4F46E5" name="Avg Hours" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No status time data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : summary?.summary?.currentWorkload?.byUser?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.summary.currentWorkload.byUser}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ username, taskCount }) => `${username}: ${taskCount}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="taskCount"
                    nameKey="username"
                  >
                    {summary.summary.currentWorkload.byUser.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No workload data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Cycle Progress */}
      {summary?.summary?.activeCycle && (
        <Card>
          <CardHeader>
            <CardTitle>Active Cycle: {summary.summary.activeCycle.cycleName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {summary.summary.activeCycle.completedTasks} / {summary.summary.activeCycle.totalTasks} tasks
                  ({Math.round((summary.summary.activeCycle.completedTasks / summary.summary.activeCycle.totalTasks) * 100) || 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.round((summary.summary.activeCycle.completedTasks / summary.summary.activeCycle.totalTasks) * 100) || 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Points: {summary.summary.activeCycle.completedPoints} / {summary.summary.activeCycle.totalPoints}</span>
                <span>
                  {new Date(summary.summary.activeCycle.startDate).toLocaleDateString()} - {new Date(summary.summary.activeCycle.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
