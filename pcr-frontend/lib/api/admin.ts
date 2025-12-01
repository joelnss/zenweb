// Admin API service - connects to backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3001/api');

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Settings {
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  admin_phone_number?: string;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE}/users`);
    const data = await response.json();
    return data.success ? data.users : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Get single user
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Admin impersonate user (login as user)
export async function impersonateUser(userId: string): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/admin/impersonate/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error impersonating user:', error);
    return { success: false, message: 'Failed to login as user' };
  }
}

// Admin reset user password
export async function resetUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'Failed to reset password' };
  }
}

// Get settings
export async function getSettings(): Promise<Settings> {
  try {
    const response = await fetch(`${API_BASE}/settings`);
    const data = await response.json();
    return data.success ? data.settings : {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

// Update settings
export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, message: 'Failed to update settings' };
  }
}

// Test SMS notification
export async function testSmsNotification(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/settings/test-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing SMS:', error);
    return { success: false, message: 'Failed to send test SMS' };
  }
}
