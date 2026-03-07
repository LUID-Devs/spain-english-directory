'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { DashboardStats, Lead } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      // For now, fetch leads and calculate stats
      const leads = await api.getLeads();
      setRecentLeads(leads.slice(0, 5));
      
      // Calculate stats from leads
      const totalLeads = leads.length;
      const newLeads = leads.filter((l: Lead) => l.status === 'new').length;
      const convertedLeads = leads.filter((l: Lead) => l.status === 'converted').length;
      
      setStats({
        profileViews: 0, // Would come from analytics
        totalLeads,
        newLeads,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Profile Views', 
      value: stats?.profileViews || 0, 
      icon: Eye, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      label: 'Total Leads', 
      value: stats?.totalLeads || 0, 
      icon: Users, 
      color: 'bg-yellow-500',
      change: '+5%'
    },
    { 
      label: 'New Leads', 
      value: stats?.newLeads || 0, 
      icon: MessageSquare, 
      color: 'bg-red-500',
      change: '+2'
    },
    { 
      label: 'Conversion Rate', 
      value: `${stats?.conversionRate || 0}%`, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      change: '+3%'
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your profile.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <span className="inline-flex items-center text-sm text-green-600 mt-2">
                    <TrendingUp size={14} className="mr-1" />
                    {stat.change}
                  </span>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <Link 
              href="/dashboard/leads"
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No leads yet</p>
                <p className="text-sm text-gray-400 mt-1">Leads will appear here when customers contact you</p>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lead.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${lead.status === 'new' ? 'bg-red-100 text-red-700' : ''}
                      ${lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${lead.status === 'converted' ? 'bg-green-100 text-green-700' : ''}
                      ${lead.status === 'archived' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="p-6 space-y-3">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
            >
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200">
                <Users size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your business information</p>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-red-600" />
            </Link>

            <Link
              href="/dashboard/leads"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
            >
              <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200">
                <MessageSquare size={24} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View Leads</p>
                <p className="text-sm text-gray-600">Check your inbox ({stats?.newLeads || 0} new)</p>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-yellow-600" />
            </Link>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                <Eye size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View Public Profile</p>
                <p className="text-sm text-gray-600">See how customers view your listing</p>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
