import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  name: string;
  count: number;
}

interface DashboardChartsProps {
  taskDistribution: ChartData[];
  projectStatus: ChartData[];
  isDarkMode: boolean;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  taskDistribution,
  projectStatus,
  isDarkMode,
}) => {
  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Task Priority Distribution
          </h3>
        </div>
        <div className="p-3 sm:p-6 sm:pt-0">
          {taskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px] md:!h-[300px]">
              <BarChart data={taskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.barGrid} />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip contentStyle={{ width: "min-content", height: "min-content" }} />
                <Legend />
                <Bar dataKey="count" fill={chartColors.bar} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p>No tasks assigned to you yet</p>
                <p className="text-sm mt-1">Start by creating your first task!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Project Status Overview
          </h3>
        </div>
        <div className="p-3 sm:p-6 sm:pt-0">
          {projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px] md:!h-[300px]">
              <PieChart>
                <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                  {projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p>No projects available</p>
                <p className="text-sm mt-1">Create your first project to get started!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;