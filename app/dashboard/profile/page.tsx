'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Upload,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { Professional, BusinessHours } from '@/lib/types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: false },
  sunday: { open: '09:00', close: '18:00', closed: true },
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '',
    description: '',
    services: [],
    hours: DEFAULT_HOURS,
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    province: '',
  });
  
  const [newService, setNewService] = useState('');
  const [professionalId, setProfessionalId] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const profile = await api.getMyProfile();
      setProfessionalId(profile.id);
      setFormData({
        ...profile,
        hours: profile.hours || DEFAULT_HOURS,
        services: profile.services || [],
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await api.updateProfile(professionalId, {
        name: formData.name,
        description: formData.description,
        services: formData.services,
        hours: formData.hours,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        province: formData.province,
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push('/dashboard');
  }

  function addService() {
    if (newService.trim() && !formData.services?.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), newService.trim()],
      }));
      setNewService('');
    }
  }

  function removeService(service: string) {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter(s => s !== service) || [],
    }));
  }

  function updateHours(day: string, field: string, value: string | boolean) {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours?.[day as keyof BusinessHours],
          [field]: value,
        },
      },
    }));
  }

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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <p className="text-gray-600 mt-1">Update your business information and services.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <select
                value={formData.province || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select province...</option>
                <option value="Madrid">Madrid</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Valencia">Valencia</option>
                <option value="Seville">Seville</option>
                <option value="Malaga">Malaga</option>
                <option value="Alicante">Alicante</option>
                <option value="Murcia">Murcia</option>
                <option value="Cadiz">Cadiz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Services</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              placeholder="Add a service..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <button
              type="button"
              onClick={addService}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.services?.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="hover:text-yellow-900"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>

          {formData.services?.length === 0 && (
            <p className="text-gray-500 text-sm">No services added yet. Add services to help customers find you.</p>
          )}
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayData = formData.hours?.[day] || { open: '09:00', close: '18:00', closed: false };
              return (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 font-medium text-gray-700 capitalize">{day}</span>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dayData.closed}
                      onChange={(e) => updateHours(day, 'closed', e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>

                  {!dayData.closed && (
                    <>
                      <input
                        type="time"
                        value={dayData.open}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={dayData.close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Photo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Photo</h3>
          
          <div className="flex items-center gap-6">
            {formData.photoUrl ? (
              <img
                src={formData.photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-400">{formData.name?.charAt(0).toUpperCase() || '?'}</span>
              </div>
            )}
            
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Photo
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
