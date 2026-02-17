import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/authProvider";
import { apiService } from "@/services/apiService";
import { useGetTeamsQuery } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGlobalStore } from "@/stores/globalStore";
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
} from "recharts";
import {
  TrendingUp,
  Clock,
  Target,
  Users,
  Calendar,
  Activity,
  Download,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import type {
  TeamVelocityResponse,
  TeamCycleTimeResponse,
  TeamThroughputResponse,
  TeamAnalyticsSummaryResponse,
} from "@/services/apiService";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useGlobalStore();
  const { data: teams, isLoading: teamsLoading } = useGetTeamsQuery();

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [cyclesCount, setCyclesCount] = useState<number>(6);

  const [velocity, setVelocity] = useState<TeamVelocityResponse | null>(null);
  const [cycleTime, setCycleTime] = useState<TeamCycleTimeResponse | null>(null);
  const [throughput, setThroughput] = useState<TeamThroughputResponse | null>(null);
  const [summary, setSummary] = useState<TeamAnalyticsSummaryResponse | null>(null);

  const [loading, setLoading] = useState<{
    velocity: boolean;
    cycleTime: boolean;
    throughput: boolean;
    summary: boolean;
  }>({
    velocity: false,
    cycleTime: false,
    throughput: false,
    summary: false,
  });

  // Set default team when teams load
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      const userTeam = teams.find((t) => t.teamId === user?.teamId);
      setSelectedTeamId(userTeam?.teamId || teams[0].teamId);
    }
  }, [teams, user?.teamId, selectedTeamId]);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!selectedTeamId) return;

    setLoading({
      velocity: true,
      cycleTime: true,
      throughput: true,
      summary: true,
    });

    try {
      const [velocityRes, cycleTimeRes, throughputRes, summaryRes] = await Promise.all([
        apiService.getTeamVelocity(selectedTeamId, cyclesCount),
        apiService.getTeamCycleTime(selectedTeamId, periodDays),
        apiService.getTeamThroughput(selectedTeamId, periodDays, "week"),
        apiService.getTeamAnalyticsSummary(selectedTeamId),
      ]);

      const responses = [velocityRes, cycleTimeRes, throughputRes, summaryRes];
      const allSuccessful = responses.every((response) => response.success !== false);
      if (!allSuccessful) {
        throw new Error("Failed to load analytics data");
      }

      setVelocity(velocityRes);
      setCycleTime(cycleTimeRes);
      setThroughput(throughputRes);
      setSummary(summaryRes);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading({
        velocity: false,
        cycleTime: false,
        throughput: false,
        summary: false,
      });
    }
  }, [selectedTeamId, periodDays, cyclesCount]);

  // Fetch on dependency change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartColors = isDarkMode
    ? { text: "#9ca3af", grid: "#374151", bar: "#3b82f6" }
    : { text: "#6b7280", grid: "#e5e7eb", bar: "#3b82f6" };

  const handleExport = () => {
    if (!summary) return;
    
    const data = {
      team: summary.team,
      summary: summary.summary,
      velocity: velocity?.velocityByCycle,
      cycleTime: cycleTime?.cycleTimeByPriority,
      throughput: throughput?.throughputData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${summary.team.name}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Analytics data exported");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header name="Team Analytics" />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {/* Team Selector */}
            <Select
              value={selectedTeamId?.toString() || ""}
              onValueChange={(value) => setSelectedTeamId(Number(value))}
              disabled={teamsLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.teamId} value={team.teamId.toString()}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Selector */}
            <Select
              value={periodDays.toString()}
              onValueChange={(value) => setPeriodDays(Number(value))}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Cycles Selector */}
            <Select
              value={cyclesCount.toString()}
              onValueChange={(value) => setCyclesCount(Number(value))}
            >
              <SelectTrigger className="w-[160px]">
                <Target className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Cycles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 cycles</SelectItem>
                <SelectItem value="6">Last 6 cycles</SelectItem>
                <SelectItem value="12">Last 12 cycles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Cycle Progress"
            value={
              summary?.summary.activeCycle?.totalTasks > 0
                ? `${Math.round((summary.summary.activeCycle.completedTasks / summary.summary.activeCycle.totalTasks) * 100)}%`
                : summary?.summary.activeCycle
                ? "0%"
                : "—"
            }
            subtitle={
              summary?.summary.activeCycle
                ? `${summary.summary.activeCycle.completedTasks} / ${summary.summary.activeCycle.totalTasks} tasks`
                : "No active cycle"
            }
            icon={Target}
            loading={loading.summary}
          />
          <MetricCard
            title="Avg Cycle Time"
            value={
              cycleTime?.averageCycleTimeDays
                ? `${cycleTime.averageCycleTimeDays.toFixed(1)} days`
                : "—"
            }
            subtitle={`${cycleTime?.tasksAnalyzed || 0} tasks analyzed`}
            icon={Clock}
            loading={loading.cycleTime}
          />
          <MetricCard
            title="Recent Throughput"
            value={summary?.summary.recentThroughput?.completedTasks?.toString() ?? "—"}
            subtitle={`${summary?.summary.recentThroughput?.averagePerDay?.toFixed(1) ?? 0} tasks/day`}
            icon={Activity}
            loading={loading.summary}
          />
          <MetricCard
            title="Team Members"
            value={summary?.team?.memberCount?.toString() ?? "—"}
            subtitle={`${summary?.summary?.currentWorkload?.activeTasks ?? 0} active tasks`}
            icon={Users}
            loading={loading.summary}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Velocity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Velocity by Cycle
              </CardTitle>
              <CardDescription>
                Tasks and points completed per cycle
                {velocity?.averageVelocity && (
                  <span className="ml-2">
                    • Avg: {velocity.averageVelocity.tasksPerCycle} tasks / {velocity.averageVelocity.pointsPerCycle} pts
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.velocity ? (
                <Skeleton className="h-[300px]" />
              ) : velocity?.velocityByCycle && velocity.velocityByCycle.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocity.velocityByCycle}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis
                      dataKey="cycleName"
                      stroke={chartColors.text}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke={chartColors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${chartColors.grid}`,
                      }}
                    />
                    <Bar dataKey="completedTasks" fill={COLORS[0]} name="Tasks" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalPoints" fill={COLORS[1]} name="Points" radius={[4, 4, 0, 0]} />
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
                <BarChart3 className="w-5 h-5 text-primary" />
                Throughput Over Time
              </CardTitle>
              <CardDescription>
                Tasks completed per week
                {throughput?.averagePerPeriod && (
                  <span className="ml-2">• Avg: {throughput.averagePerPeriod.toFixed(1)} tasks/week</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.throughput ? (
                <Skeleton className="h-[300px]" />
              ) : throughput?.throughputData && throughput.throughputData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={throughput.throughputData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis
                      dataKey="period"
                      stroke={chartColors.text}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis stroke={chartColors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${chartColors.grid}`,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completedTasks"
                      stroke={COLORS[0]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[0], strokeWidth: 0, r: 4 }}
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
                <Clock className="w-5 h-5 text-primary" />
                Cycle Time by Priority
              </CardTitle>
              <CardDescription>
                Average days from start to completion
                {cycleTime?.averageCycleTimeDays && (
                  <span className="ml-2">• Overall avg: {cycleTime.averageCycleTimeDays.toFixed(1)} days</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.cycleTime ? (
                <Skeleton className="h-[300px]" />
              ) : cycleTime?.cycleTimeByPriority && cycleTime.cycleTimeByPriority.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cycleTime.cycleTimeByPriority} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis type="number" stroke={chartColors.text} />
                    <YAxis
                      type="category"
                      dataKey="priority"
                      stroke={chartColors.text}
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${chartColors.grid}`,
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} days`, "Avg Cycle Time"]}
                    />
                    <Bar dataKey="averageCycleTime" fill={COLORS[2]} radius={[0, 4, 4, 0]}>
                      {cycleTime.cycleTimeByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No cycle time data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workload Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Current Workload Distribution
              </CardTitle>
              <CardDescription>
                Active tasks per team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.summary ? (
                <Skeleton className="h-[300px]" />
              ) : summary?.summary.currentWorkload.byUser &&
                summary.summary.currentWorkload.byUser.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summary.summary.currentWorkload.byUser}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="taskCount"
                      nameKey="username"
                    >
                      {summary.summary.currentWorkload.byUser.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        border: `1px solid ${chartColors.grid}`,
                      }}
                      formatter={(value: number, name: string) => [`${value} tasks`, name]}
                    />
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

        {/* Cycle Time Details Table */}
        {cycleTime?.cycleTimeByPriority && cycleTime.cycleTimeByPriority.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cycle Time Details by Priority</CardTitle>
              <CardDescription>Breakdown of completion times across priority levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {cycleTime.cycleTimeByPriority.map((item) => (
                  <div key={item.priority} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          item.priority === "Urgent"
                            ? "destructive"
                            : item.priority === "High"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{item.averageCycleTime.toFixed(1)}d</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} tasks • {item.min.toFixed(1)}-{item.max.toFixed(1)}d range
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  loading: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, loading }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          )}
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsPage;
