'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Location {
  id: string;
  name: string;
  address: string;
  description: string;
  createdAt: string;
}

export default function LocationsManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Location, 'id' | 'createdAt'>>({
    name: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLocations();
    }
  }, [isAuthenticated]);

  const loadLocations = () => {
    const storedLocations = JSON.parse(localStorage.getItem('pcr_locations') || '[]');
    setLocations(storedLocations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing location
      const updatedLocations = locations.map(item =>
        item.id === editingId
          ? { ...item, ...formData }
          : item
      );
      localStorage.setItem('pcr_locations', JSON.stringify(updatedLocations));
      setLocations(updatedLocations);
    } else {
      // Add new location
      const newLocation: Location = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      const updatedLocations = [...locations, newLocation];
      localStorage.setItem('pcr_locations', JSON.stringify(updatedLocations));
      setLocations(updatedLocations);
    }

    // Reset form
    setFormData({
      name: '',
      address: '',
      description: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (item: Location) => {
    setFormData({
      name: item.name,
      address: item.address,
      description: item.description,
    });
    setEditingId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    // Check if location is being used by any hardware
    const hardware = JSON.parse(localStorage.getItem('pcr_hardware') || '[]');
    const locationInUse = hardware.some((hw: any) => hw.location === locations.find(l => l.id === id)?.name);

    if (locationInUse) {
      alert('Cannot delete this location as it is being used by hardware items. Please update or remove those hardware items first.');
      return;
    }

    if (confirm('Are you sure you want to delete this location?')) {
      const updatedLocations = locations.filter(item => item.id !== id);
      localStorage.setItem('pcr_locations', JSON.stringify(updatedLocations));
      setLocations(updatedLocations);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      address: '',
      description: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Location Management</h1>
              <p className="text-gray-600">Manage physical locations for hardware inventory</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/hardware"
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
              >
                Hardware
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Main Office, Warehouse A, Storage Room 2"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., 123 Main St, Floor 2"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Optional description or notes about this location..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update Location' : 'Add Location'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Locations List */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Locations ({locations.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {locations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</h3>
                  <p className="text-gray-600">Add your first location using the form</p>
                </div>
              ) : (
                locations.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.address}
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                        {item.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
