// Analytics API service

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3001/api');

export interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  todayPageViews: number;
  todayVisitors: number;
}

export interface PageView {
  path: string;
  views: number;
}

export interface DayViews {
  date: string;
  views: number;
}

export interface Referrer {
  referrer: string;
  count: number;
}

export interface RecentVisitor {
  path: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface AnalyticsData {
  success: boolean;
  period: string;
  stats: AnalyticsStats;
  pagesByViews: PageView[];
  viewsByDay: DayViews[];
  topReferrers: Referrer[];
  recentVisitors: RecentVisitor[];
}

// Generate or get session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// Track a page view
export async function trackPageView(path: string): Promise<void> {
  try {
    const sessionId = getSessionId();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    await fetch(`${API_BASE}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer, sessionId }),
    });
  } catch (error) {
    // Silently fail - don't break the app for analytics
    console.debug('Analytics tracking failed:', error);
  }
}

// Get analytics data (admin)
export async function getAnalytics(period: string = '7d'): Promise<AnalyticsData | null> {
  try {
    const response = await fetch(`${API_BASE}/analytics?period=${period}`);
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

// Get excluded IPs
export async function getExcludedIPs(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/analytics/excluded-ips`);
    const data = await response.json();
    return data.success ? data.excludedIPs : '';
  } catch (error) {
    console.error('Error fetching excluded IPs:', error);
    return '';
  }
}

// Update excluded IPs
export async function updateExcludedIPs(ips: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/analytics/excluded-ips`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ips }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating excluded IPs:', error);
    return { success: false, message: 'Failed to update excluded IPs' };
  }
}

// Get current user's IP
export async function getMyIP(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/analytics/my-ip`);
    const data = await response.json();
    return data.success ? data.ip : '';
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '';
  }
}
