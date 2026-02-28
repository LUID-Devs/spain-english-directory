/* eslint-disable react/prop-types, no-unused-vars */
import { useState, useEffect, useMemo, memo } from 'react';
import { toast } from 'sonner';
import MainLayout from '../../components/layouts/MainLayout';
import { jobApplicationApiService } from '../../stores/api';
import { resumeApiService } from '../../stores/api/resumeApi';
import {
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  MessageSquare,
  List,
  LayoutGrid,
  Send,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { logger } from '../../utils/logger.js';

// URL sanitization utility - prevents XSS via javascript: URLs
const sanitizeUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
    return null;
  } catch {
    // Invalid URL
    return null;
  }
};

// Date formatting utility
const formatDate = (date, formatStr) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (formatStr === 'MMM d') {
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  if (formatStr === 'MMM d, yyyy') {
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  if (formatStr === 'MMM d, yyyy h:mm a') {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes < 10 ? '0' + minutes : minutes;
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${m} ${ampm}`;
  }
  if (formatStr === 'yyyy-MM-dd') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return d.toLocaleDateString();
};

const parseNotesPayload = (notes) => {
  if (!notes) return { general: '', interviewPrep: '' };
  if (typeof notes === 'object') {
    return {
      general: notes.general || '',
      interviewPrep: notes.interviewPrep || '',
    };
  }
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object') {
      return {
        general: parsed.general || '',
        interviewPrep: parsed.interviewPrep || '',
      };
    }
  } catch (error) {
    return { general: notes, interviewPrep: '' };
  }
  return { general: notes, interviewPrep: '' };
};

const serializeNotesPayload = ({ general, interviewPrep }) => {
  const trimmedGeneral = general?.trim() || '';
  const trimmedInterview = interviewPrep?.trim() || '';
  if (trimmedInterview) {
    return JSON.stringify({
      general: trimmedGeneral,
      interviewPrep: trimmedInterview,
    });
  }
  return trimmedGeneral;
};

// Application status configuration
const STATUS_CONFIG = {
  Saved: {
    label: 'Saved',
    color: 'bg-slate-500',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: List,
  },
  Applied: {
    label: 'Applied',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: Send,
  },
  'Phone Screen': {
    label: 'Phone Screen',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    icon: MessageSquare,
  },
  Interview: {
    label: 'Interview',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    icon: MessageSquare,
  },
  'Technical Interview': {
    label: 'Technical Interview',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    icon: MessageSquare,
  },
  'Final Round': {
    label: 'Final Round',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    icon: MessageSquare,
  },
  Offer: {
    label: 'Offer',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
  },
  Accepted: {
    label: 'Accepted',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Rejected',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
  Withdrawn: {
    label: 'Withdrawn',
    color: 'bg-rose-500',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-200',
    icon: XCircle,
  },
  Ghosted: {
    label: 'Ghosted',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: XCircle,
  },
};

// Status Badge Component
const StatusBadge = memo(function StatusBadge({ status, size = 'default' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
  const Icon = config.icon;

  const sizeClasses = {
    default: 'px-2.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
});

// Application Card Component
const ApplicationCard = memo(function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onStatusChange,
  isSelected,
  onSelect,
}) {
  const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.Applied;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpDate = application.nextFollowUpDate ? new Date(application.nextFollowUpDate) : null;
  const deadlineDate = application.deadline ? new Date(application.deadline) : null;
  const isFollowUpOverdue = followUpDate && followUpDate < today;
  const isDeadlineOverdue = deadlineDate && deadlineDate < today;

  return (
    <Card
      className={`group relative cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onSelect(application)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {application.position}
            </h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{application.company}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(application); }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(STATUS_CONFIG).map(([key, statusConfig]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(application.id, key); }}
                  disabled={application.status === key}
                >
                  <statusConfig.icon className="w-4 h-4 mr-2" />
                  Move to {statusConfig.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(application.id); }}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <StatusBadge status={application.status} size="sm" />
          {application.salaryRange && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {application.salaryRange}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {application.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {application.appliedDate
              ? formatDate(new Date(application.appliedDate), 'MMM d')
              : 'Not applied'}
          </span>
        </div>

        {(followUpDate || deadlineDate) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
            {followUpDate && (
              <span className={`flex items-center gap-1 ${isFollowUpOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="w-3 h-3" />
                Follow-up {formatDate(followUpDate, 'MMM d')}
              </span>
            )}
            {deadlineDate && (
              <span className={`flex items-center gap-1 ${isDeadlineOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="w-3 h-3" />
                Deadline {formatDate(deadlineDate, 'MMM d')}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Stats Card Component
const StatsCard = memo(function StatsCard({ title, value, trend, trendValue, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend === 'neutral' && <Minus className="w-4 h-4" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Main Component
function JobApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewMode, setViewMode] = useState('board');

  // Form state for add/edit
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    location: '',
    salaryRange: '',
    jobPostingUrl: '',
    status: 'Applied',
    resumeId: '',
    notes: '',
    interviewPrep: '',
    appliedDate: '',
    nextFollowUpDate: '',
    deadline: '',
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsResult, resumesResult] = await Promise.all([
        jobApplicationApiService.getAll(),
        resumeApiService.getAll(),
      ]);

      if (appsResult.success) {
        setApplications(appsResult.data || []);
      }
      if (resumesResult.success) {
        setResumes(resumesResult.data || []);
      }
    } catch (error) {
      logger.error("Failed to load data:", {}, error);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Group by status for board view
  const groupedApplications = useMemo(() => {
    const groups = {};
    Object.keys(STATUS_CONFIG).forEach((key) => {
      groups[key] = filteredApplications.filter((app) => app.status === key);
    });
    return groups;
  }, [filteredApplications]);

  // Reset form when opening dialog
  useEffect(() => {
    if (isDialogOpen) {
      if (editingApplication) {
        const parsedNotes = parseNotesPayload(editingApplication.notes);
        setFormData({
          position: editingApplication.position || '',
          company: editingApplication.company || '',
          location: editingApplication.location || '',
          salaryRange: editingApplication.salaryRange || '',
          jobPostingUrl: editingApplication.jobPostingUrl || '',
          status: editingApplication.status || 'Applied',
          resumeId: editingApplication.resumeId || '',
          notes: parsedNotes.general || '',
          interviewPrep: parsedNotes.interviewPrep || '',
          appliedDate: editingApplication.appliedDate
            ? formatDate(new Date(editingApplication.appliedDate), 'yyyy-MM-dd')
            : '',
          nextFollowUpDate: editingApplication.nextFollowUpDate
            ? formatDate(new Date(editingApplication.nextFollowUpDate), 'yyyy-MM-dd')
            : '',
          deadline: editingApplication.deadline
            ? formatDate(new Date(editingApplication.deadline), 'yyyy-MM-dd')
            : '',
        });
      } else {
        setFormData({
          position: '',
          company: '',
          location: '',
          salaryRange: '',
          jobPostingUrl: '',
          status: 'Applied',
          resumeId: '',
          notes: '',
          interviewPrep: '',
          appliedDate: '',
          nextFollowUpDate: '',
          deadline: '',
        });
      }
    }
  }, [isDialogOpen, editingApplication]);

  // Handlers
  const handleSaveApplication = async (e) => {
    e.preventDefault();
    const payload = {
      position: formData.position,
      company: formData.company,
      location: formData.location,
      salaryRange: formData.salaryRange,
      jobPostingUrl: formData.jobPostingUrl,
      status: formData.status,
      resumeId: formData.resumeId || null,
      notes: serializeNotesPayload({
        general: formData.notes,
        interviewPrep: formData.interviewPrep,
      }),
      appliedDate: formData.appliedDate || null,
      nextFollowUpDate: formData.nextFollowUpDate || null,
      deadline: formData.deadline || null,
    };

    const result = editingApplication
      ? await jobApplicationApiService.update(editingApplication.id, payload)
      : await jobApplicationApiService.create(payload);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingApplication(null);
      loadData();
      // Update selectedApplication for both create and edit cases
      if (result.data) {
        setSelectedApplication(result.data);
      }
      toast.success(editingApplication ? 'Application updated successfully' : 'Application created successfully');
    } else {
      toast.error(result.error || 'Failed to save application');
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    const result = await jobApplicationApiService.delete(id);
    if (result.success) {
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
      loadData();
      toast.success('Application deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete application');
    }
  };

  const handleStatusChange = async (id, status) => {
    const result = await jobApplicationApiService.updateStatus(id, status);
    if (result.success) {
      await loadData();
      if (selectedApplication?.id === id) {
        const updated = await jobApplicationApiService.getById(id);
        if (updated.success) {
          setSelectedApplication(updated.data);
        }
      }
      toast.success('Status updated successfully');
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingApplication(null);
    setIsDialogOpen(true);
  };

  const handleSelectApplication = async (application) => {
    if (!application?.id) {
      setSelectedApplication(application || null);
      return;
    }
    const result = await jobApplicationApiService.getById(application.id);
    if (result.success) {
      setSelectedApplication(result.data);
    } else {
      setSelectedApplication(application);
    }
  };

  // Calculate stats for display
  const totalApplications = applications.length;
  const inactiveStatuses = ['Rejected', 'Withdrawn', 'Ghosted', 'Accepted'];
  const activeApplications = applications.filter(
    (a) => !inactiveStatuses.includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) =>
    ['Phone Screen', 'Interview', 'Technical Interview', 'Final Round'].includes(a.status)
  ).length;
  const offerCount = applications.filter((a) => ['Offer', 'Accepted'].includes(a.status)).length;

  // Detail panel content
  const renderDetailPanel = () => {
    if (!selectedApplication) return null;
    const app = selectedApplication;
    const parsedNotes = parseNotesPayload(app.notes);
    const lastUpdated = app.updatedAt
      ? formatDate(new Date(app.updatedAt), 'MMM d, yyyy h:mm a')
      : null;

    return (
      <div className="h-full flex flex-col bg-card border-l">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{app.position}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building2 className="w-4 h-4" />
                <span>{app.company}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedApplication(null)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-4">
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(app.id, e.target.value)}
              className="w-full sm:w-[160px] h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {app.location && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {app.location}
              </div>
            )}
            {app.salaryRange && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                {app.salaryRange}
              </div>
            )}
            {app.appliedDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Applied {formatDate(new Date(app.appliedDate), 'MMM d, yyyy')}
              </div>
            )}
            {app.nextFollowUpDate && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Follow-up {formatDate(new Date(app.nextFollowUpDate), 'MMM d, yyyy')}
              </div>
            )}
            {app.deadline && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Deadline {formatDate(new Date(app.deadline), 'MMM d, yyyy')}
              </div>
            )}
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Updated {lastUpdated}
              </div>
            )}
            {sanitizeUrl(app.jobPostingUrl) && (
              <a
                href={sanitizeUrl(app.jobPostingUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Job Posting
              </a>
            )}
            {app.resumeId && (
              <button
                onClick={() => window.open(`/dashboard/resume/${app.resumeId}/edit`, '_blank')}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                View Resume
              </button>
            )}
          </div>

        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium">Notes</h4>
              {parsedNotes.general ? (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {parsedNotes.general}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground italic">No notes yet.</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium">Interview Prep</h4>
              {parsedNotes.interviewPrep ? (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {parsedNotes.interviewPrep}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground italic">No interview prep added.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  Job Application Tracker
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all your job applications in one place
                </p>
              </div>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Applications"
              value={totalApplications}
              icon={Briefcase}
            />
            <StatsCard
              title="Active Applications"
              value={activeApplications}
              trend={activeApplications > 0 ? 'up' : 'neutral'}
              trendValue={`${Math.round((activeApplications / Math.max(totalApplications, 1)) * 100)}% active`}
              icon={CheckCircle2}
            />
            <StatsCard
              title="In Interview"
              value={interviewCount}
              icon={MessageSquare}
            />
            <StatsCard
              title="Offers Received"
              value={offerCount}
              trend={offerCount > 0 ? 'up' : 'neutral'}
              trendValue={offerCount > 0 ? 'Congratulations!' : 'Keep going!'}
              icon={CheckCircle2}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode('board')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100vh-380px)]">
          {/* Applications List/Board */}
          <div className={`${selectedApplication ? 'hidden lg:block lg:w-2/3' : 'w-full'} overflow-auto p-6`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No applications yet</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Start tracking your job search by adding your first application
                </p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Application
                </Button>
              </div>
            ) : viewMode === 'board' ? (
              <div className="flex gap-4 overflow-x-auto pb-4 min-h-full">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <div key={status} className="flex-shrink-0 w-72">
                    <div className={`flex items-center justify-between p-3 rounded-t-lg ${config.bgColor}`}>
                      <div className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 ${config.textColor}`} />
                        <span className={`font-medium ${config.textColor}`}>{config.label}</span>
                      </div>
                      <Badge variant="secondary">{groupedApplications[status].length}</Badge>
                    </div>
                    <div className={`p-3 rounded-b-lg border border-t-0 ${config.borderColor} bg-muted/30 min-h-[200px] space-y-3`}>
                      {groupedApplications[status].map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          onEdit={handleEdit}
                          onDelete={handleDeleteApplication}
                          onStatusChange={handleStatusChange}
                          isSelected={selectedApplication?.id === app.id}
                          onSelect={handleSelectApplication}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-w-4xl">
                {filteredApplications.map((app) => (
                  <Card
                    key={app.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectApplication(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{app.position}</h4>
                            <p className="text-sm text-muted-foreground">{app.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={app.status} />
                          <span className="text-sm text-muted-foreground">
                            {app.appliedDate
                              ? formatDate(new Date(app.appliedDate), 'MMM d, yyyy')
                              : 'Not applied'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedApplication && (
            <div className="w-full lg:w-1/3">
              {renderDetailPanel()}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApplication ? 'Edit Application' : 'Add Application'}</DialogTitle>
            <DialogDescription>
              {editingApplication
                ? 'Update the details of your job application.'
                : 'Track a new job application.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveApplication} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Job Title *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Inc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  placeholder="e.g. $100k - $150k"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobPostingUrl">Job Posting URL</Label>
              <Input
                id="jobPostingUrl"
                type="url"
                value={formData.jobPostingUrl}
                onChange={(e) => setFormData({ ...formData, jobPostingUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appliedDate">Applied Date</Label>
                <Input
                  id="appliedDate"
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nextFollowUpDate">Follow-up Date</Label>
                <Input
                  id="nextFollowUpDate"
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeId">Associated Resume</Label>
              <select
                id="resumeId"
                value={formData.resumeId}
                onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>{resume.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about the role or application..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewPrep">Interview Prep</Label>
              <Textarea
                id="interviewPrep"
                value={formData.interviewPrep}
                onChange={(e) => setFormData({ ...formData, interviewPrep: e.target.value })}
                placeholder="Capture prep notes, questions, and reminders..."
                className="min-h-[120px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingApplication ? 'Update' : 'Add'} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default JobApplicationTracker;
