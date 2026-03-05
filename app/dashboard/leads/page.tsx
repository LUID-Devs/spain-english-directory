'use client';

import { useEffect, useState } from 'react';
import { 
  Mail, 
  Phone, 
  Clock, 
  Check,
  Archive,
  User,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { Lead } from '@/lib/types';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-red-700', bgColor: 'bg-red-100' },
  contacted: { label: 'Contacted', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  converted: { label: 'Converted', color: 'text-green-700', bgColor: 'bg-green-100' },
  archived: { label: 'Archived', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await api.getLeads();
      setLeads(data);
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    try {
      await api.updateLeadStatus(leadId, status);
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = 
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    archived: leads.filter(l => l.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
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
            onClick={loadLeads}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-64px)] lg:h-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leads Inbox</h2>
        <p className="text-gray-600 mt-1">Manage your customer inquiries and track conversions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {(['all', 'new', 'contacted', 'converted', 'archived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`
              p-3 rounded-lg text-left transition-colors
              ${filter === status 
                ? 'bg-red-50 border-2 border-red-500' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <p className="text-sm text-gray-600 capitalize">{status === 'all' ? 'All Leads' : status}</p>
            <p className="text-2xl font-bold text-gray-900">{stats[status]}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, email, or message..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Inquiries</h3>
          </div>

          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No leads found</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const statusConfig = STATUS_CONFIG[lead.status];
                const isSelected = selectedLead?.id === lead.id;
                
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`
                      w-full p-4 text-left transition-colors
                      ${isSelected ? 'bg-red-50 border-l-4 border-red-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lead.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock size={14} />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Lead Detail */}
        <div className="lg:col-span-2">
          {selectedLead ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedLead.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-1 hover:text-red-600">
                          <Mail size={14} /> {selectedLead.email}
                        </a>
                        {selectedLead.phone && (
                          <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-1 hover:text-red-600">
                            <Phone size={14} /> {selectedLead.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${STATUS_CONFIG[selectedLead.status].bgColor}
                    ${STATUS_CONFIG[selectedLead.status].color}
                  `}>
                    {STATUS_CONFIG[selectedLead.status].label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <Clock size={16} />
                  Received on {new Date(selectedLead.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare size={20} className="text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Message</h4>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Update Status</h4>
                
                <div className="flex flex-wrap gap-2">
                  {(['new', 'contacted', 'converted', 'archived'] as LeadStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      disabled={selectedLead.status === status}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${selectedLead.status === status
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color} hover:opacity-80`
                        }
                      `}
                    >
                      {selectedLead.status === status && <Check size={14} className="inline mr-1" />}
                      Mark as {STATUS_CONFIG[status].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Mail size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a lead to view details</h3>
              <p className="text-gray-500">Click on any lead from the list to see the full message and contact details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
