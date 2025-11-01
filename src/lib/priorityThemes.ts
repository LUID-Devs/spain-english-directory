import { Priority } from "@/services/apiService";

export interface PriorityTheme {
  name: string;
  gradient: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lightBg: string;
  darkBg: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  badgeClasses: string;
  buttonClasses: string;
  cardClasses: string;
  emptyStateIcon: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
  motivationalMessage: string;
  // New properties for improved text readability
  gradientOverlay: string;
  shadowClasses: string;
  contrastTextColor: string;
  textBackdrop: string;
}

export const priorityThemes: Record<Priority, PriorityTheme> = {
  [Priority.Urgent]: {
    name: "Urgent",
    gradient: "from-red-500 via-red-600 to-orange-600",
    primaryColor: "rgb(239, 68, 68)", // red-500
    secondaryColor: "rgb(220, 38, 38)", // red-600
    accentColor: "rgb(249, 115, 22)", // orange-500
    lightBg: "rgb(254, 242, 242)", // red-50
    darkBg: "rgb(127, 29, 29)", // red-900/50
    textColor: "rgb(239, 68, 68)", // red-500
    borderColor: "rgb(252, 165, 165)", // red-300
    hoverColor: "rgb(248, 113, 113)", // red-400
    badgeClasses: "bg-red-100 text-red-900 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
    buttonClasses: "bg-red-500 hover:bg-red-600 focus:ring-red-500 border-red-500",
    cardClasses: "border-l-red-500 hover:border-red-300 dark:hover:border-red-700",
    emptyStateIcon: "🚨",
    emptyStateTitle: "No Urgent Tasks",
    emptyStateMessage: "Great! You don't have any urgent tasks at the moment.",
    motivationalMessage: "Keep up the excellent work! Having no urgent tasks means you're staying ahead of deadlines.",
    gradientOverlay: "bg-black/60",
    shadowClasses: "shadow-lg drop-shadow-sm",
    contrastTextColor: "text-white",
    textBackdrop: "bg-black/20 rounded-lg px-4 py-2"
  },
  [Priority.High]: {
    name: "High",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    primaryColor: "rgb(249, 115, 22)", // orange-500
    secondaryColor: "rgb(234, 88, 12)", // orange-600
    accentColor: "rgb(245, 158, 11)", // amber-500
    lightBg: "rgb(255, 247, 237)", // orange-50
    darkBg: "rgb(124, 45, 18)", // orange-900/50
    textColor: "rgb(249, 115, 22)", // orange-500
    borderColor: "rgb(253, 186, 116)", // orange-300
    hoverColor: "rgb(251, 146, 60)", // orange-400
    badgeClasses: "bg-orange-100 text-orange-900 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
    buttonClasses: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 border-orange-500",
    cardClasses: "border-l-orange-500 hover:border-orange-300 dark:hover:border-orange-700",
    emptyStateIcon: "⚡",
    emptyStateTitle: "No High Priority Tasks",
    emptyStateMessage: "You're all caught up on high priority items!",
    motivationalMessage: "Excellent prioritization! Your high-impact tasks are under control.",
    gradientOverlay: "bg-black/60",
    shadowClasses: "shadow-lg drop-shadow-sm",
    contrastTextColor: "text-white",
    textBackdrop: " bg-black/20 rounded-lg px-4 py-2"
  },
  [Priority.Medium]: {
    name: "Medium",
    gradient: "from-blue-500 via-blue-600 to-teal-600",
    primaryColor: "rgb(59, 130, 246)", // blue-500
    secondaryColor: "rgb(37, 99, 235)", // blue-600
    accentColor: "rgb(20, 184, 166)", // teal-500
    lightBg: "rgb(239, 246, 255)", // blue-50
    darkBg: "rgb(30, 58, 138)", // blue-900/50
    textColor: "rgb(59, 130, 246)", // blue-500
    borderColor: "rgb(147, 197, 253)", // blue-300
    hoverColor: "rgb(96, 165, 250)", // blue-400
    badgeClasses: "bg-blue-100 text-blue-900 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
    buttonClasses: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 border-blue-500",
    cardClasses: "border-l-blue-500 hover:border-blue-300 dark:hover:border-blue-700",
    emptyStateIcon: "📋",
    emptyStateTitle: "No Medium Priority Tasks",
    emptyStateMessage: "Your medium priority tasks are all handled!",
    motivationalMessage: "Nice work! You're maintaining good balance in your task management.",
    gradientOverlay: "bg-black/60",
    shadowClasses: "shadow-lg drop-shadow-sm",
    contrastTextColor: "text-white",
    textBackdrop: " bg-black/20 rounded-lg px-4 py-2"
  },
  [Priority.Low]: {
    name: "Low",
    gradient: "from-green-500 via-green-600 to-emerald-600",
    primaryColor: "rgb(34, 197, 94)", // green-500
    secondaryColor: "rgb(22, 163, 74)", // green-600
    accentColor: "rgb(16, 185, 129)", // emerald-500
    lightBg: "rgb(240, 253, 244)", // green-50
    darkBg: "rgb(20, 83, 45)", // green-900/50
    textColor: "rgb(34, 197, 94)", // green-500
    borderColor: "rgb(134, 239, 172)", // green-300
    hoverColor: "rgb(74, 222, 128)", // green-400
    badgeClasses: "bg-green-100 text-green-900 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20",
    buttonClasses: "bg-green-500 hover:bg-green-600 focus:ring-green-500 border-green-500",
    cardClasses: "border-l-green-500 hover:border-green-300 dark:hover:border-green-700",
    emptyStateIcon: "🌱",
    emptyStateTitle: "No Low Priority Tasks",
    emptyStateMessage: "All your low priority tasks are complete!",
    motivationalMessage: "Wonderful! You're staying on top of even your smallest tasks.",
    gradientOverlay: "bg-black/60",
    shadowClasses: "shadow-lg drop-shadow-sm",
    contrastTextColor: "text-white",
    textBackdrop: " bg-black/20 rounded-lg px-4 py-2"
  },
  [Priority.Backlog]: {
    name: "Backlog",
    gradient: "from-gray-500 via-gray-600 to-slate-600",
    primaryColor: "rgb(107, 114, 128)", // gray-500
    secondaryColor: "rgb(75, 85, 99)", // gray-600
    accentColor: "rgb(71, 85, 105)", // slate-600
    lightBg: "rgb(249, 250, 251)", // gray-50
    darkBg: "rgb(55, 65, 81)", // gray-700/50
    textColor: "rgb(107, 114, 128)", // gray-500
    borderColor: "rgb(209, 213, 219)", // gray-300
    hoverColor: "rgb(156, 163, 175)", // gray-400
    badgeClasses: "bg-gray-100 text-gray-900 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/20",
    buttonClasses: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500 border-gray-500",
    cardClasses: "border-l-gray-500 hover:border-gray-300 dark:hover:border-gray-700",
    emptyStateIcon: "📦",
    emptyStateTitle: "No Backlog Items",
    emptyStateMessage: "Your backlog is empty - time to brainstorm new ideas!",
    motivationalMessage: "A clean slate for future planning. Perfect time to think about what's next!",
    gradientOverlay: "bg-black/60",
    shadowClasses: "shadow-lg drop-shadow-sm",
    contrastTextColor: "text-white",
    textBackdrop: " bg-black/20 rounded-lg px-4 py-2"
  }
};

export const getPriorityTheme = (priority: Priority): PriorityTheme => {
  return priorityThemes[priority];
};

export const getPriorityBadgeClasses = (priority: Priority): string => {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityThemes[priority].badgeClasses}`;
};

export const getPriorityButtonClasses = (priority: Priority): string => {
  const theme = priorityThemes[priority];
  return `inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.buttonClasses}`;
};

export const getPriorityCardClasses = (priority: Priority): string => {
  const theme = priorityThemes[priority];
  return `border-l-4 transition-all duration-200 ${theme.cardClasses}`;
};

export const getPriorityGradientClasses = (priority: Priority): string => {
  return `bg-gradient-to-r ${priorityThemes[priority].gradient}`;
};

export const getPriorityGradientOverlay = (priority: Priority): string => {
  return priorityThemes[priority].gradientOverlay;
};

export const getPriorityShadowClasses = (priority: Priority): string => {
  return priorityThemes[priority].shadowClasses;
};

export const getPriorityContrastTextColor = (priority: Priority): string => {
  return priorityThemes[priority].contrastTextColor;
};

export const getPriorityTextBackdrop = (priority: Priority): string => {
  return priorityThemes[priority].textBackdrop;
};