'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Hardware {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: string;
  stock: number;
  location: string;
  description: string;
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

export default function AdminHardwarePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showQuickAddLocation, setShowQuickAddLocation] = useState(false);
  const [quickLocationName, setQuickLocationName] = useState('');
  const [quickLocationAddress, setQuickLocationAddress] = useState('');
  const [formData, setFormData] = useState<Omit<Hardware, 'id' | 'createdAt'>>({
    name: '',
    category: '',
    brand: '',
    model: '',
    price: '',
    stock: 0,
    location: '',
    description: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHardware();
      loadLocations();
    }
  }, [isAuthenticated]);

  const loadHardware = () => {
    const storedHardware = JSON.parse(localStorage.getItem('pcr_hardware') || '[]');
    setHardware(storedHardware);
  };

  const loadLocations = () => {
    const storedLocations = JSON.parse(localStorage.getItem('pcr_locations') || '[]');
    setLocations(storedLocations);
  };

  const handleQuickAddLocation = () => {
    if (!quickLocationName.trim() || !quickLocationAddress.trim()) {
      alert('Please enter both location name and address');
      return;
    }

    const newLocation: Location = {
      id: Date.now().toString(),
      name: quickLocationName,
      address: quickLocationAddress,
    };

    const updatedLocations = [...locations, newLocation];
    localStorage.setItem('pcr_locations', JSON.stringify(updatedLocations));
    setLocations(updatedLocations);
    setFormData({ ...formData, location: quickLocationName });
    setQuickLocationName('');
    setQuickLocationAddress('');
    setShowQuickAddLocation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing hardware
      const updatedHardware = hardware.map(item =>
        item.id === editingId
          ? { ...item, ...formData }
          : item
      );
      localStorage.setItem('pcr_hardware', JSON.stringify(updatedHardware));
      setHardware(updatedHardware);
    } else {
      // Add new hardware
      const newHardware: Hardware = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      const updatedHardware = [...hardware, newHardware];
      localStorage.setItem('pcr_hardware', JSON.stringify(updatedHardware));
      setHardware(updatedHardware);
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      price: '',
      stock: 0,
      location: '',
      description: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (item: Hardware) => {
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,
      price: item.price,
      stock: item.stock,
      location: item.location,
      description: item.description,
    });
    setEditingId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hardware item?')) {
      const updatedHardware = hardware.filter(item => item.id !== id);
      localStorage.setItem('pcr_hardware', JSON.stringify(updatedHardware));
      setHardware(updatedHardware);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      price: '',
      stock: 0,
      location: '',
      description: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleCreateTicket = (item: Hardware) => {
    // Store selected hardware in localStorage for the ticket form
    localStorage.setItem('pcr_selected_hardware', JSON.stringify(item));
    router.push('/#submit-ticket');
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
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Hardware Management</h1>
              <p className="text-gray-600">Manage hardware inventory for ticket forms</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/locations"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all"
              >
                Manage Locations
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

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Hardware' : 'Add New Hardware'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Hardware Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., Dell Latitude 7420"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select...</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Mouse">Mouse</option>
                <option value="Networking">Networking</option>
                <option value="Storage">Storage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., Dell"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                id="model"
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., Latitude 7420"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., $899"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="0"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddLocation(!showQuickAddLocation)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showQuickAddLocation ? 'Cancel' : '+ Add New Location'}
                </button>
              </div>

              {showQuickAddLocation ? (
                <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <input
                    type="text"
                    value={quickLocationName}
                    onChange={(e) => setQuickLocationName(e.target.value)}
                    placeholder="Location name (e.g., Main Office)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <input
                    type="text"
                    value={quickLocationAddress}
                    onChange={(e) => setQuickLocationAddress(e.target.value)}
                    placeholder="Address (e.g., 123 Main St)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddLocation}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add & Select Location
                  </button>
                </div>
              ) : (
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} - {loc.address}
                    </option>
                  ))}
                </select>
              )}

              {locations.length === 0 && !showQuickAddLocation && (
                <p className="text-xs text-red-600 mt-1">
                  No locations available. Please add a location first.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Optional description..."
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {editingId ? 'Update Hardware' : 'Add Hardware'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Hardware List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Hardware Inventory ({hardware.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hardware.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hardware Yet</h3>
                <p className="text-gray-600">Add your first hardware item using the form above</p>
              </div>
            ) : (
              hardware.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.brand} {item.model}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{item.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Price:</span>
                      <span className="text-green-600 font-semibold">{item.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Location:</span>
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">{item.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCreateTicket(item)}
                      className="px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Ticket
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
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
  );
}
