'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SupportTicketForm from '@/components/portal/SupportTicketForm';
import { getAllTickets as getAllTicketsAPI, updateTicket as updateTicketAPI, createTicket as createTicketAPI, Ticket as ZenwebTicket, getTicketComments, addTicketComment, TicketComment, createPaymentCheckout, verifyPayment } from '@/lib/api/tickets';
import { getAllUsers } from '@/lib/data/users';
import { getAllUsers as getAllUsersAPI, impersonateUser, resetUserPassword, getSettings, updateSettings, testSmsNotification, Settings } from '@/lib/api/admin';
import { getAnalytics, getExcludedIPs, updateExcludedIPs, getMyIP, AnalyticsData } from '@/lib/api/analytics';

interface Ticket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  platform: string;
  serviceCategory: string;
  hostingNeeds?: string;
  budget?: string;
  timeline?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  issueType?: string;
  type?: string;
  proposalAmount?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  paidAt?: string;
  customerType?: 'new' | 'returning';
  relatedProjectId?: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items: { description: string; amount: number }[];
}

interface Message {
  id: string;
  ticketId: string;
  sender: 'user' | 'support';
  senderName: string;
  content: string;
  createdAt: string;
}

type NavSection = 'overview' | 'projects' | 'support' | 'invoices' | 'company' | 'team' | 'settings' | 'all-requests' | 'all-support' | 'users' | 'analytics';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role: 'admin' | 'customer';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

// Sample data for customers
const sampleProjects: Ticket[] = [
  {
    id: 'sample-1',
    ticketNumber: 'WEB-001234-567',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '(555) 123-4567',
    company: 'Acme Corporation',
    website: 'https://acmecorp.com',
    platform: 'Shopify',
    serviceCategory: 'ecommerce',
    hostingNeeds: 'cloud',
    budget: '15k-50k',
    timeline: '1-3-months',
    description: 'Complete eCommerce platform redesign with custom checkout flow, inventory management integration, and multi-currency support for international expansion.',
    priority: 'high',
    status: 'in-progress',
    userId: null,
    createdAt: '2024-11-01T10:30:00Z',
    updatedAt: '2024-11-20T14:15:00Z',
  },
  {
    id: 'sample-2',
    ticketNumber: 'WEB-001235-890',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '(555) 123-4567',
    company: 'Acme Corporation',
    website: 'https://acmecorp.com',
    platform: 'Next.js / React',
    serviceCategory: 'performance',
    hostingNeeds: 'cloud',
    budget: '5k-15k',
    timeline: '1-month',
    description: 'Performance optimization for existing React application - improve load times, implement caching, and optimize database queries.',
    priority: 'medium',
    status: 'open',
    userId: null,
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-11-15T09:00:00Z',
  },
];

const sampleSupportTickets: Ticket[] = [
  {
    id: 'support-sample-1',
    ticketNumber: 'SUP-001001-123',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '(555) 123-4567',
    company: 'Acme Corporation',
    website: 'https://acmecorp.com',
    platform: 'Shopify',
    serviceCategory: '',
    description: 'Need help with payment gateway configuration. Stripe webhooks not triggering properly on successful payments.',
    priority: 'high',
    status: 'open',
    userId: null,
    createdAt: '2024-11-22T11:30:00Z',
    updatedAt: '2024-11-22T11:30:00Z',
    issueType: 'Payment Integration',
  },
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<Ticket | null>(null);
  const [proposalInput, setProposalInput] = useState<string>('');
  const [supportProposalInput, setSupportProposalInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [smsSettings, setSmsSettings] = useState<Settings>({});
  const [smsSettingsLoading, setSmsSettingsLoading] = useState(false);
  const [smsTestResult, setSmsTestResult] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [excludedIPs, setExcludedIPsState] = useState('');
  const [myIP, setMyIPState] = useState('');

  // Load analytics data
  const loadAnalytics = async (period: string = '7d') => {
    setAnalyticsLoading(true);
    const data = await getAnalytics(period);
    setAnalyticsData(data);
    setAnalyticsLoading(false);
  };

  // Load excluded IPs and current IP
  const loadIPSettings = async () => {
    const ips = await getExcludedIPs();
    setExcludedIPsState(ips);
    const ip = await getMyIP();
    setMyIPState(ip);
  };

  // Save excluded IPs
  const handleSaveExcludedIPs = async () => {
    const result = await updateExcludedIPs(excludedIPs);
    if (result.success) {
      alert('Excluded IPs saved successfully');
    } else {
      alert(result.message || 'Failed to save excluded IPs');
    }
  };

  // Add my IP to excluded list
  const handleExcludeMyIP = () => {
    if (myIP && !excludedIPs.includes(myIP)) {
      const newIPs = excludedIPs ? `${excludedIPs}, ${myIP}` : myIP;
      setExcludedIPsState(newIPs);
    }
  };

  // Handle payment for a ticket
  const handlePayment = async (ticketId: string) => {
    setProcessingPayment(true);
    try {
      const result = await createPaymentCheckout(ticketId);
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        alert(result.message || 'Failed to create payment session');
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
    setProcessingPayment(false);
  };

  // Refresh current ticket data
  const handleRefreshTicket = async () => {
    setRefreshing(true);
    await loadTickets();
    // Re-select the ticket to get updated data
    if (selectedSupportTicket) {
      const updatedTickets = await getAllTicketsAPI();
      const updatedTicket = updatedTickets.find(t => t.id === selectedSupportTicket.id);
      if (updatedTicket) {
        const mapped = {
          ...selectedSupportTicket,
          proposalAmount: updatedTicket.proposalAmount,
          paymentStatus: updatedTicket.paymentStatus as 'unpaid' | 'paid' | 'pending',
          paidAt: updatedTicket.paidAt,
          status: updatedTicket.status === 'new' ? 'open' : updatedTicket.status,
        };
        setSelectedSupportTicket(mapped);
      }
      await loadMessages(selectedSupportTicket.id);
    }
    if (selectedTicket) {
      const updatedTickets = await getAllTicketsAPI();
      const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        const mapped = {
          ...selectedTicket,
          proposalAmount: updatedTicket.proposalAmount,
          paymentStatus: updatedTicket.paymentStatus as 'unpaid' | 'paid' | 'pending',
          paidAt: updatedTicket.paidAt,
          status: updatedTicket.status === 'new' ? 'open' : updatedTicket.status,
        };
        setSelectedTicket(mapped);
      }
      await loadTicketComments(selectedTicket.id);
    }
    setRefreshing(false);
  };

  // Test function to create a support ticket and verify storage
  const handleTestSupportTicket = async () => {
    setTestResult('Testing...');

    // Create a test support ticket
    const result = await createTicketAPI({
      userId: user?.id || null,
      requestType: 'technical_issue',
      issueType: 'bug',
      affectedArea: 'frontend',
      description: 'Test support ticket created from admin dashboard',
      stepsToReproduce: 'This is a test ticket to verify the support ticket system is working correctly.',
      priority: 'normal',
      contactName: 'Test User',
      contactEmail: 'test@example.com',
      contactCompany: 'Test Company',
    });

    if (result.success) {
      // Reload tickets to verify
      await loadTickets();
      setTestResult(`Success! Ticket ${result.ticket?.ticketNumber} created. Check "All Support Tickets" to see it.`);
      setTimeout(() => setTestResult(null), 5000);
    } else {
      setTestResult(`Error: ${result.message}`);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // Load comments for a ticket
  const loadTicketComments = async (ticketId: string) => {
    const comments = await getTicketComments(ticketId);
    setTicketComments(comments);
  };

  // Send a reply/comment on a ticket
  const handleSendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;

    setSendingReply(true);
    const result = await addTicketComment(ticketId, {
      userId: user?.id || null,
      userName: user?.name || user?.email || 'Anonymous',
      userRole: user?.role === 'admin' ? 'admin' : 'user',
      message: replyText.trim(),
    });

    if (result.success) {
      setReplyText('');
      await loadTicketComments(ticketId);
    }
    setSendingReply(false);
  };

  // Debug function to refresh from API
  const handleDebugRefresh = async () => {
    setTestResult('Fetching from backend API...');

    try {
      const allTickets = await getAllTicketsAPI();
      const supportCount = allTickets.filter((t: ZenwebTicket) => t.requestType === 'technical_issue').length;
      const projectCount = allTickets.filter((t: ZenwebTicket) => t.requestType === 'new_project').length;

      console.log('=== API DEBUG ===');
      console.log('All tickets from API:', allTickets);

      await loadTickets();

      setTestResult(`Backend has ${allTickets.length} total tickets (${projectCount} projects, ${supportCount} support). User role: ${user?.role}`);
      setTimeout(() => setTestResult(null), 10000);
    } catch (error) {
      setTestResult(`Error connecting to backend API. Make sure the server is running on port 3001.`);
      setTimeout(() => setTestResult(null), 10000);
    }
  };

  // Handle login as user (admin impersonation)
  const handleLoginAsUser = async (userId: string) => {
    const result = await impersonateUser(userId);
    if (result.success && result.user) {
      // Store the impersonated user in localStorage
      localStorage.setItem('zenwebUser', JSON.stringify({ ...result.user, isImpersonated: true, originalAdmin: user }));
      // Refresh the page to apply the new user context
      window.location.reload();
    } else {
      alert(result.message || 'Failed to login as user');
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;

    setPasswordResetLoading(true);
    const result = await resetUserPassword(selectedUser.id, newPassword);
    setPasswordResetLoading(false);

    if (result.success) {
      alert(result.message);
      setShowPasswordReset(false);
      setNewPassword('');
    } else {
      alert(result.message || 'Failed to reset password');
    }
  };

  // Load SMS settings
  const loadSmsSettings = async () => {
    const settings = await getSettings();
    setSmsSettings(settings);
  };

  // Save SMS settings
  const handleSaveSmsSettings = async () => {
    setSmsSettingsLoading(true);
    const result = await updateSettings(smsSettings);
    setSmsSettingsLoading(false);

    if (result.success) {
      setSmsTestResult('Settings saved successfully!');
      setTimeout(() => setSmsTestResult(null), 3000);
    } else {
      setSmsTestResult('Failed to save settings');
      setTimeout(() => setSmsTestResult(null), 3000);
    }
  };

  // Test SMS notification
  const handleTestSms = async () => {
    setSmsSettingsLoading(true);
    const result = await testSmsNotification();
    setSmsSettingsLoading(false);

    setSmsTestResult(result.message);
    setTimeout(() => setSmsTestResult(null), 5000);
  };

  // Invoices data - will be loaded from backend in future
  const [invoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
      loadUsers();
      if (user?.role === 'admin') {
        loadSmsSettings();
      }
    }
  }, [isAuthenticated, user]);

  // Load comments when a ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      loadTicketComments(selectedTicket.id);
      setReplyText('');
    } else {
      setTicketComments([]);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    // Load all tickets from backend API
    const allZenwebTickets = await getAllTicketsAPI();
    const allUsers = getAllUsers();

    // Debug logging
    console.log('=== LOAD TICKETS DEBUG ===');
    console.log('All tickets from API:', allZenwebTickets);
    console.log('Total tickets count:', allZenwebTickets.length);
    console.log('Current user:', user);
    console.log('User role:', user?.role);

    // Separate project requests and support tickets based on requestType
    const projectRequests = allZenwebTickets.filter(t => t.requestType === 'new_project');
    const supportRequests = allZenwebTickets.filter(t => t.requestType === 'technical_issue');

    console.log('Project requests:', projectRequests.length);
    console.log('Support requests:', supportRequests.length);

    // Map zenweb tickets to the dashboard Ticket format
    const mapToTicket = (t: ZenwebTicket): Ticket => {
      // Look up user info if ticket has userId but no contact info
      let ticketUser = null;
      if (t.userId && (!t.contactName || !t.contactEmail)) {
        ticketUser = allUsers.find(u => u.id === t.userId);
      }

      return {
        id: t.id,
        ticketNumber: t.ticketNumber,
        name: t.contactName || ticketUser?.name || '',
        email: t.contactEmail || ticketUser?.email || '',
        phone: t.contactPhone || ticketUser?.phone || '',
        company: t.contactCompany || ticketUser?.company || '',
        website: t.website || '',
        platform: t.projectType || '',
        serviceCategory: t.category || '',
        description: t.description,
        priority: t.priority === 'critical' ? 'urgent' : t.priority === 'high' ? 'high' : t.priority === 'normal' ? 'medium' : 'low',
        status: t.status === 'new' ? 'open' : t.status,
        userId: t.userId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        issueType: t.issueType,
        type: t.requestType,
        proposalAmount: t.proposalAmount,
        paymentStatus: t.paymentStatus as 'unpaid' | 'paid' | 'pending',
        paidAt: t.paidAt,
      };
    };

    if (user?.role === 'admin') {
      // Admin sees all tickets
      console.log('Admin branch - setting ALL tickets');
      console.log('Setting project tickets:', projectRequests.length);
      console.log('Setting support tickets:', supportRequests.length);
      setTickets(projectRequests.map(mapToTicket));
      setSupportTickets(supportRequests.map(mapToTicket));
    } else {
      console.log('Customer branch - filtering by user');
      // Customer sees their own tickets + sample data if no real tickets
      const userProjectTickets = projectRequests.filter(t => t.userId === user?.id || t.contactEmail === user?.email);
      setTickets(userProjectTickets.length > 0 ? userProjectTickets.map(mapToTicket) : sampleProjects);

      const userSupportTickets = supportRequests.filter(t => t.userId === user?.id || t.contactEmail === user?.email);
      setSupportTickets(userSupportTickets.length > 0 ? userSupportTickets.map(mapToTicket) : sampleSupportTickets);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, ticketType: 'project' | 'support') => {
    // Use backend API
    await updateTicketAPI(ticketId, { status: newStatus });
    // Reload tickets to get updated data
    await loadTickets();
    setSelectedTicket(null);
  };

  // Update proposal amount for a project request
  const updateProposalAmount = async (ticketId: string, amount: number) => {
    // Save to backend API
    await updateTicketAPI(ticketId, { proposalAmount: amount });
    // Reload tickets to get updated data
    await loadTickets();
    // Update the selected ticket as well
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, proposalAmount: amount });
    }
  };

  // Update proposal amount for a support ticket
  const updateSupportProposalAmount = async (ticketId: string, amount: number) => {
    // Save to backend API
    await updateTicketAPI(ticketId, { proposalAmount: amount });
    // Reload tickets to get updated data
    await loadTickets();
    // Update the selected ticket as well
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, proposalAmount: amount });
    }
  };

  // Load registered users (for admin) - now fetches from API
  const loadUsers = async () => {
    if (user?.role === 'admin') {
      try {
        const apiUsers = await getAllUsersAPI();
        // Transform API users to RegisteredUser format
        const formattedUsers: RegisteredUser[] = apiUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company || '',
          phone: u.phone || '',
          role: (u.role as 'admin' | 'customer') || 'customer',
          createdAt: u.createdAt || new Date().toISOString(),
          lastLogin: undefined,
          status: 'active' as const,
          notes: '',
        }));
        setRegisteredUsers(formattedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to localStorage if API fails
        const storedUsers = JSON.parse(localStorage.getItem('pcr_users') || '[]');
        const formattedUsers: RegisteredUser[] = storedUsers.map((u: { id: string; name: string; email: string; company?: string; phone?: string; role?: string; createdAt?: string; lastLogin?: string; status?: string; notes?: string }) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          company: u.company || '',
          phone: u.phone || '',
          role: (u.role as 'admin' | 'customer') || 'customer',
          createdAt: u.createdAt || new Date().toISOString(),
          lastLogin: u.lastLogin,
          status: (u.status as 'active' | 'inactive' | 'suspended') || 'active',
          notes: u.notes || '',
        }));
        setRegisteredUsers(formattedUsers);
      }
    }
  };

  // Update user details
  const updateUser = (updatedUser: RegisteredUser) => {
    const storedUsers = JSON.parse(localStorage.getItem('pcr_users') || '[]');
    const updatedUsers = storedUsers.map((u: RegisteredUser) =>
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('pcr_users', JSON.stringify(updatedUsers));
    setRegisteredUsers(updatedUsers.map((u: { id: string; name: string; email: string; company?: string; phone?: string; role?: string; createdAt?: string; lastLogin?: string; status?: string; notes?: string }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company || '',
      phone: u.phone || '',
      role: (u.role as 'admin' | 'customer') || 'customer',
      createdAt: u.createdAt || new Date().toISOString(),
      lastLogin: u.lastLogin,
      status: (u.status as 'active' | 'inactive' | 'suspended') || 'active',
      notes: u.notes || '',
    })));
    setEditingUser(null);
    setSelectedUser(updatedUser);
  };

  // Delete user
  const deleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const storedUsers = JSON.parse(localStorage.getItem('pcr_users') || '[]');
      const filteredUsers = storedUsers.filter((u: RegisteredUser) => u.id !== userId);
      localStorage.setItem('pcr_users', JSON.stringify(filteredUsers));
      loadUsers();
      setSelectedUser(null);
      setEditingUser(null);
    }
  };

  // Load messages for a ticket - now uses API
  const loadMessages = async (ticketId: string) => {
    const comments = await getTicketComments(ticketId);
    // Transform API comments to Message format for customer view
    const formattedMessages: Message[] = comments.map(c => ({
      id: c.id,
      ticketId: c.ticketId,
      sender: c.userRole === 'admin' ? 'support' : 'user',
      senderName: c.userRole === 'admin' ? 'Support Team' : c.userName,
      content: c.message,
      createdAt: c.createdAt,
    }));
    setMessages(formattedMessages);
  };

  // Send a new message - now uses API
  const sendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    const result = await addTicketComment(ticketId, {
      userId: user?.id || null,
      userName: user?.name || user?.email || 'Customer',
      userRole: user?.role === 'admin' ? 'admin' : 'user',
      message: newMessage.trim(),
    });

    if (result.success) {
      setNewMessage('');
      // Reload messages to get the new one
      await loadMessages(ticketId);
    }
  };

  // Select a support ticket and load its messages
  const selectSupportTicket = (ticket: Ticket) => {
    setSelectedSupportTicket(ticket);
    loadMessages(ticket.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pending-payment':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'closed':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${theme === 'dark' ? 'border-blue-600' : 'border-gray-900'}`}></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Admin navigation items
  const adminNavItems = [
    { id: 'overview', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'all-requests', label: 'All Project Requests', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'all-support', label: 'All Support Tickets', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'users', label: 'Users & Accounts', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  // Customer navigation items
  const customerNavItems = [
    { id: 'overview', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'projects', label: 'Projects', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'support', label: 'Support Tickets', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'invoices', label: 'Invoices & Billing', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'company', label: 'Company Profile', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { id: 'team', label: 'Team & Users', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'settings', label: 'Account Settings', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : customerNavItems;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        // Admin Overview
        if (user?.role === 'admin') {
          return (
            <div className="space-y-6">
              {/* Admin Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Project Requests</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tickets.length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Open Requests</p>
                      <p className="text-3xl font-bold text-orange-500">{tickets.filter(t => t.status === 'open').length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Support Tickets</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{supportTickets.length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>In Progress</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tickets.filter(t => t.status === 'in-progress').length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('all-requests')}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Project Requests</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View and respond to customer requests</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('all-support')}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manage Support Tickets</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Handle customer support requests</p>
                  </div>
                </button>

                <button
                  onClick={handleTestSupportTicket}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                    theme === 'dark' ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20' : 'bg-green-50 border border-green-200 hover:border-green-300 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Test Support Ticket Form</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-green-400/60' : 'text-green-600'}`}>Create a test ticket to verify system</p>
                  </div>
                </button>

                <button
                  onClick={handleDebugRefresh}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                    theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-yellow-50 border border-yellow-200 hover:border-yellow-300 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                    <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>Debug & Refresh</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400/60' : 'text-yellow-600'}`}>Show raw storage data & reload</p>
                  </div>
                </button>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-4 rounded-xl ${
                  testResult.includes('Success')
                    ? theme === 'dark' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-green-100 border border-green-300 text-green-700'
                    : testResult.includes('Error')
                    ? theme === 'dark' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-red-100 border border-red-300 text-red-700'
                    : theme === 'dark' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-blue-100 border border-blue-300 text-blue-700'
                }`}>
                  {testResult}
                </div>
              )}

              {/* Recent Activity for Admin */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Project Requests */}
                <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Project Requests</h3>
                    <button onClick={() => setActiveSection('all-requests')} className="text-sm text-blue-500 hover:text-blue-600">
                      View All
                    </button>
                  </div>
                  <div className="p-4">
                    {tickets.slice(0, 5).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No project requests yet</p>
                    ) : (
                      <div className="space-y-3">
                        {tickets.slice(0, 5).map((ticket) => (
                          <div key={ticket.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.company || ticket.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{ticket.serviceCategory} • {formatDate(ticket.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Support Tickets */}
                <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Support Tickets</h3>
                    <button onClick={() => setActiveSection('all-support')} className="text-sm text-blue-500 hover:text-blue-600">
                      View All
                    </button>
                  </div>
                  <div className="p-4">
                    {supportTickets.slice(0, 5).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No support tickets yet</p>
                    ) : (
                      <div className="space-y-3">
                        {supportTickets.slice(0, 5).map((ticket) => (
                          <div key={ticket.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber || ticket.id}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.issueType || 'Support Request'}</p>
                            <p className="text-xs text-gray-500 mt-1">{ticket.company || ticket.name} • {formatDate(ticket.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Customer Overview
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Active Projects</p>
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tickets.filter(t => t.status !== 'closed' && t.status !== 'completed').length}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Open Support Tickets</p>
                    <p className="text-3xl font-bold text-orange-500">{supportTickets.filter(t => t.status === 'open' || t.status === 'urgent').length}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/#submit-ticket"
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Start New Project</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Request a quote or start development</p>
                </div>
              </Link>

              <Link
                href="/portal"
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Submit Support Ticket</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Report an issue or request help</p>
                </div>
              </Link>

              <button
                onClick={() => setActiveSection('invoices')}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all text-left ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Make a Payment</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>View and pay invoices</p>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <div className="bg-white/5 rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                  <button onClick={() => setActiveSection('projects')} className="text-sm text-blue-400 hover:text-blue-300">
                    View All
                  </button>
                </div>
                <div className="p-4">
                  {tickets.slice(0, 3).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No projects yet</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{ticket.ticketNumber}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-1">{ticket.serviceCategory || ticket.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(ticket.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Support Tickets */}
              <div className="bg-white/5 rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Support Tickets</h3>
                  <button onClick={() => setActiveSection('support')} className="text-sm text-blue-400 hover:text-blue-300">
                    View All
                  </button>
                </div>
                <div className="p-4">
                  {supportTickets.slice(0, 3).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No support tickets</p>
                  ) : (
                    <div className="space-y-3">
                      {supportTickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{ticket.ticketNumber || ticket.id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-1">{ticket.issueType || 'Support Request'}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(ticket.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Projects</h2>
              <Link
                href="/#submit-ticket"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                + New Project
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No projects yet</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Start a new project request to get started</p>
                <Link href="/#submit-ticket" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg">
                  Start a Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    {/* Header with ticket number, status, priority, and proposal amount */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{formatDate(ticket.createdAt)}</p>
                      </div>
                      {/* Proposal Amount Display */}
                      {ticket.proposalAmount && (
                        <div className={`text-right px-4 py-3 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                        }`}>
                          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Proposal Amount</p>
                          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${ticket.proposalAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Contact Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Company</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.company || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Platform</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.platform || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Service Category</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.serviceCategory || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                            {ticket.website ? (
                              <a href={ticket.website.startsWith('http') ? ticket.website : `https://${ticket.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {ticket.website}
                              </a>
                            ) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hosting Requirements</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.hostingNeeds || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Budget & Timeline</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Estimated Budget</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.budget || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Project Timeline</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.timeline || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Description */}
                    <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project Description</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{ticket.description || 'No description provided'}</p>
                    </div>

                    {/* Admin Payment Amount Input for Projects */}
                    {user?.role === 'admin' && (
                      <div className={`rounded-lg p-4 mt-4 ${theme === 'dark' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                        <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Set Proposal Amount</h4>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              defaultValue={ticket.proposalAmount || ''}
                              id={`proposal-${ticket.id}`}
                              className={`w-full pl-7 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                              }`}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const input = document.getElementById(`proposal-${ticket.id}`) as HTMLInputElement;
                              const amount = parseFloat(input?.value || '0');
                              if (!isNaN(amount) && amount > 0) {
                                updateProposalAmount(ticket.id, amount);
                              }
                            }}
                            className={`px-6 py-2 font-medium rounded-lg transition-all ${
                              theme === 'dark'
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            Save Amount
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showNewTicketForm ? 'New Support Ticket' : 'Support Tickets'}
              </h2>
              <button
                onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                className={`px-4 py-2 font-medium rounded-lg transition-all ${
                  showNewTicketForm
                    ? theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
                }`}
              >
                {showNewTicketForm ? 'Cancel' : '+ New Ticket'}
              </button>
            </div>

            {/* Inline New Ticket Form */}
            {showNewTicketForm ? (
              <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <SupportTicketForm onSuccess={() => {
                  // Reload tickets and close form after short delay to show success message
                  setTimeout(() => {
                    loadTickets();
                    setShowNewTicketForm(false);
                  }, 2000);
                }} />
              </div>
            ) : supportTickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No support tickets</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Need help? Submit a support ticket</p>
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Submit Ticket
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ticket List */}
                <div className="lg:col-span-1 space-y-3">
                  {supportTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => selectSupportTicket(ticket)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedSupportTicket?.id === ticket.id
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{ticket.ticketNumber || ticket.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{ticket.issueType || 'Support Request'}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
                        {ticket.proposalAmount && (
                          <span className="text-xs font-medium text-green-400">${ticket.proposalAmount.toLocaleString()}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ticket Detail & Conversation */}
                <div className="lg:col-span-2">
                  {selectedSupportTicket ? (
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden h-full flex flex-col">
                      {/* Ticket Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white">{selectedSupportTicket.ticketNumber || selectedSupportTicket.id}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSupportTicket.status)}`}>
                                {selectedSupportTicket.status}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedSupportTicket.priority)}`}>
                                {selectedSupportTicket.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{selectedSupportTicket.issueType || 'Support Request'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Proposal Amount Display with Pay Now button */}
                            {selectedSupportTicket.proposalAmount && (
                              selectedSupportTicket.paymentStatus === 'paid' ? (
                                <div className={`text-right px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50`}>
                                  <p className="text-xs font-medium text-green-400">Paid</p>
                                  <p className="text-lg font-bold text-green-400">
                                    ${selectedSupportTicket.proposalAmount.toLocaleString()}
                                  </p>
                                </div>
                              ) : user?.role !== 'admin' ? (
                                <button
                                  onClick={() => handlePayment(selectedSupportTicket.id)}
                                  disabled={processingPayment}
                                  className={`text-right px-4 py-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                                    theme === 'dark'
                                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-400'
                                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-400'
                                  }`}
                                >
                                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                                    {processingPayment ? 'Processing...' : 'Click to Pay'}
                                  </p>
                                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ${selectedSupportTicket.proposalAmount.toLocaleString()}
                                  </p>
                                </button>
                              ) : (
                                <div className={`text-right px-4 py-2 rounded-xl ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                                }`}>
                                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Amount (Unpaid)</p>
                                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ${selectedSupportTicket.proposalAmount.toLocaleString()}
                                  </p>
                                </div>
                              )
                            )}
                            {/* Refresh Button */}
                            <button
                              onClick={handleRefreshTicket}
                              disabled={refreshing}
                              className={`p-2 rounded-lg transition-all ${
                                theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                              } ${refreshing ? 'animate-spin' : ''}`}
                              title="Refresh ticket data"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setSelectedSupportTicket(null)}
                              className="text-gray-400 hover:text-white"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* Ticket Information Grid - All Form Fields */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Issue Type</p>
                            <p className="text-white">{(selectedSupportTicket as any).issueType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Affected Area</p>
                            <p className="text-white">{(selectedSupportTicket as any).affectedArea || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Severity</p>
                            <p className="text-white">{(selectedSupportTicket as any).priority || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Browser</p>
                            <p className="text-white">{(selectedSupportTicket as any).browser || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Website URL</p>
                            <p className="text-white">{selectedSupportTicket.website || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Created</p>
                            <p className="text-white">{formatDate(selectedSupportTicket.createdAt)}</p>
                          </div>
                        </div>
                        {/* All Technical Details - Always show */}
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Error Message</p>
                            {(selectedSupportTicket as any).errorMessage ? (
                              <p className="text-red-400 font-mono text-sm mt-1 p-2 bg-red-500/10 rounded">{(selectedSupportTicket as any).errorMessage}</p>
                            ) : (
                              <p className="text-white mt-1">N/A</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Steps to Reproduce</p>
                            <p className="text-white mt-1 whitespace-pre-wrap">{selectedSupportTicket.description || (selectedSupportTicket as any).stepsToReproduce || 'N/A'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-500 text-xs">Expected Behavior</p>
                              <p className="text-white mt-1">{(selectedSupportTicket as any).expectedBehavior || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Actual Behavior</p>
                              <p className="text-white mt-1">{(selectedSupportTicket as any).actualBehavior || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Screenshot/Video URL</p>
                            {(selectedSupportTicket as any).screenshot ? (
                              <a href={(selectedSupportTicket as any).screenshot} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{(selectedSupportTicket as any).screenshot}</a>
                            ) : (
                              <p className="text-white mt-1">N/A</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Additional Information</p>
                            <p className="text-white mt-1 whitespace-pre-wrap">{(selectedSupportTicket as any).additionalInfo || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Admin Payment Amount Input */}
                        {user?.role === 'admin' && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Set Payment Amount</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                      type="number"
                                      placeholder="0.00"
                                      defaultValue={selectedSupportTicket.proposalAmount || ''}
                                      className="w-full pl-7 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      onBlur={(e) => {
                                        const amount = parseFloat(e.target.value);
                                        if (!isNaN(amount) && amount > 0) {
                                          updateSupportProposalAmount(selectedSupportTicket.id, amount);
                                        }
                                      }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const input = document.querySelector('input[type="number"][placeholder="0.00"]') as HTMLInputElement;
                                      const amount = parseFloat(input?.value || '0');
                                      if (!isNaN(amount) && amount > 0) {
                                        updateSupportProposalAmount(selectedSupportTicket.id, amount);
                                      }
                                    }}
                                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-all"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Conversation Area */}
                      <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4">
                        {/* Initial ticket description as first message */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium flex-shrink-0">
                            {selectedSupportTicket.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                              <p className="text-sm text-white">{selectedSupportTicket.description}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{selectedSupportTicket.name} • {formatDate(selectedSupportTicket.createdAt)}</p>
                          </div>
                        </div>

                        {/* Messages */}
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'support' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                              msg.sender === 'support'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {msg.sender === 'support' ? 'S' : msg.senderName.charAt(0)}
                            </div>
                            <div className={`flex-1 ${msg.sender === 'support' ? 'text-right' : ''}`}>
                              <div className={`inline-block rounded-lg p-3 border max-w-[85%] ${
                                msg.sender === 'support'
                                  ? 'bg-cyan-500/10 border-cyan-500/20 text-left'
                                  : 'bg-blue-500/10 border-blue-500/20'
                              }`}>
                                <p className="text-sm text-white">{msg.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {msg.senderName} • {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-white/10">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedSupportTicket.id)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                          <button
                            onClick={() => sendMessage(selectedSupportTicket.id)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-xl border border-white/10 flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-gray-400">Select a ticket to view conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Invoices & Billing</h2>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <p className="text-sm text-gray-400 mb-1">Total Paid</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
                <p className="text-sm text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {formatCurrency(invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-500/30">
                <p className="text-sm text-gray-400 mb-1">Overdue</p>
                <p className="text-3xl font-bold text-red-400">
                  {formatCurrency(invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
            </div>

            {/* Invoice List */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Invoice</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Due Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 text-white font-medium">{invoice.number}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(invoice.date)}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(invoice.dueDate)}</td>
                      <td className="px-6 py-4 text-white font-semibold">{formatCurrency(invoice.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'pending' && (
                          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
                            Pay Now
                          </button>
                        )}
                        {invoice.status === 'paid' && (
                          <button className="px-4 py-2 bg-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/20 transition-all">
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Company Profile</h2>

            <div className="bg-white/5 rounded-xl border border-white/10 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                    <input
                      type="text"
                      defaultValue="Acme Corporation"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Industry</label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                      <option className="bg-gray-900">eCommerce</option>
                      <option className="bg-gray-900">Technology</option>
                      <option className="bg-gray-900">Healthcare</option>
                      <option className="bg-gray-900">Finance</option>
                      <option className="bg-gray-900">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                    <input
                      type="url"
                      defaultValue="https://example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="(555) 123-4567"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                    <input
                      type="text"
                      defaultValue="123 Business Ave"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                      <input
                        type="text"
                        defaultValue="New York"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                      <input
                        type="text"
                        defaultValue="NY"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      defaultValue="10001"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tax ID / EIN</label>
                    <input
                      type="text"
                      placeholder="XX-XXXXXXX"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Team & Users</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                + Invite User
              </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user?.name}</p>
                          <p className="text-sm text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                        Owner
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-white">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Roles</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Owner</p>
                    <p className="text-sm text-gray-400">Full access to all features and billing</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Admin</p>
                    <p className="text-sm text-gray-400">Manage projects, tickets, and team members</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Member</p>
                    <p className="text-sm text-gray-400">View projects and submit tickets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        // Load analytics when this section is shown
        if (!analyticsData && !analyticsLoading) {
          loadAnalytics(analyticsPeriod);
          loadIPSettings();
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Site Analytics</h2>
              <div className="flex items-center gap-3">
                <select
                  value={analyticsPeriod}
                  onChange={(e) => {
                    setAnalyticsPeriod(e.target.value);
                    loadAnalytics(e.target.value);
                  }}
                  className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <button
                  onClick={() => loadAnalytics(analyticsPeriod)}
                  disabled={analyticsLoading}
                  className={`px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  {analyticsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Page Views</p>
                <p className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analyticsData?.stats.totalPageViews || 0}
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Unique Visitors</p>
                <p className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analyticsData?.stats.uniqueVisitors || 0}
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Today&apos;s Views</p>
                <p className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analyticsData?.stats.todayPageViews || 0}
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Today&apos;s Visitors</p>
                <p className={`text-3xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {analyticsData?.stats.todayVisitors || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Pages</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {analyticsData?.pagesByViews.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No page views yet</p>
                  ) : (
                    analyticsData?.pagesByViews.map((page, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-sm truncate flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{page.path}</span>
                        <span className={`text-sm font-medium ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{page.views}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Views by Day */}
              <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Views by Day</h3>
                </div>
                <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {analyticsData?.viewsByDay.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No data yet</p>
                  ) : (
                    analyticsData?.viewsByDay.map((day, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`text-sm w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{day.date}</span>
                        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.min(100, (day.views / Math.max(...(analyticsData?.viewsByDay.map(d => d.views) || [1]))) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-12 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{day.views}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Referrers */}
              <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Referrers</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {analyticsData?.topReferrers.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No referrers yet</p>
                  ) : (
                    analyticsData?.topReferrers.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-sm truncate flex-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{ref.referrer || 'Direct'}</span>
                        <span className={`text-sm font-medium ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ref.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Visitors */}
              <div className={`rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Visitors</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {analyticsData?.recentVisitors.length === 0 ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No visitors yet</p>
                  ) : (
                    analyticsData?.recentVisitors.map((visitor, i) => (
                      <div key={i} className={`text-sm p-2 rounded ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{visitor.path}</span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(visitor.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          IP: {visitor.ip}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Excluded IPs */}
            <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Excluded IPs</h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                These IP addresses will not be tracked. Your current IP: <span className="font-mono">{myIP || 'Loading...'}</span>
              </p>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={excludedIPs}
                  onChange={(e) => setExcludedIPsState(e.target.value)}
                  placeholder="Comma-separated IPs (e.g., 192.168.1.1, 10.0.0.1)"
                  className={`flex-1 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
                <button
                  onClick={handleExcludeMyIP}
                  className={`px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  Add My IP
                </button>
                <button
                  onClick={handleSaveExcludedIPs}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>

            <div className="bg-white/5 rounded-xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates about your projects</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-white/5 border-white/20 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white font-medium">Invoice Reminders</p>
                    <p className="text-sm text-gray-400">Get notified about upcoming payments</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-white/5 border-white/20 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer">
                  <div>
                    <p className="text-white font-medium">Support Updates</p>
                    <p className="text-sm text-gray-400">Notifications when tickets are updated</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-white/5 border-white/20 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            </div>

            {/* SMS Notifications - Admin Only */}
            {user?.role === 'admin' && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-8">
                <h3 className="text-lg font-semibold text-white mb-2">SMS Notifications (Admin)</h3>
                <p className="text-sm text-gray-400 mb-6">Configure Twilio SMS to receive notifications when new tickets or projects are created.</p>

                {smsTestResult && (
                  <div className={`mb-6 p-4 rounded-lg ${smsTestResult.includes('success') || smsTestResult.includes('Success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {smsTestResult}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Twilio Account SID</label>
                    <input
                      type="text"
                      value={smsSettings.twilio_account_sid || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_account_sid: e.target.value })}
                      placeholder="AC..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={smsSettings.twilio_auth_token || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_auth_token: e.target.value })}
                      placeholder="Enter auth token"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Twilio Phone Number</label>
                    <input
                      type="tel"
                      value={smsSettings.twilio_phone_number || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, twilio_phone_number: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Your Phone Number (receives SMS)</label>
                    <input
                      type="tel"
                      value={smsSettings.admin_phone_number || ''}
                      onChange={(e) => setSmsSettings({ ...smsSettings, admin_phone_number: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSaveSmsSettings}
                    disabled={smsSettingsLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {smsSettingsLoading ? 'Saving...' : 'Save SMS Settings'}
                  </button>
                  <button
                    onClick={handleTestSms}
                    disabled={smsSettingsLoading}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {smsSettingsLoading ? 'Sending...' : 'Send Test SMS'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Need a Twilio account? Visit <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">twilio.com</a> to sign up.
                  Free trial includes SMS credits.
                </p>

                {/* Stripe Settings Section */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Stripe Payment Settings
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">Configure Stripe to accept credit card payments for ticket proposals.</p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Stripe Publishable Key</label>
                      <input
                        type="text"
                        value={smsSettings.stripe_publishable_key || ''}
                        onChange={(e) => setSmsSettings({ ...smsSettings, stripe_publishable_key: e.target.value })}
                        placeholder="pk_live_..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Stripe Secret Key</label>
                      <input
                        type="password"
                        value={smsSettings.stripe_secret_key || ''}
                        onChange={(e) => setSmsSettings({ ...smsSettings, stripe_secret_key: e.target.value })}
                        placeholder="sk_live_..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSmsSettings}
                    disabled={smsSettingsLoading}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {smsSettingsLoading ? 'Saving...' : 'Save Stripe Settings'}
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    Need a Stripe account? Visit <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">stripe.com</a> to sign up.
                    Get your API keys from the Stripe Dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'all-requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Project Requests</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{tickets.length} total requests</span>
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No project requests yet</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Customer project requests will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket List */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Requests</h3>
                  </div>
                  <div className={`divide-y max-h-[600px] overflow-y-auto ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full p-4 text-left transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-blue-500/10 border-l-4 border-blue-500'
                            : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.company || ticket.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Detail */}
                {selectedTicket ? (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.ticketNumber}</h3>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                      {/* Customer Info */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Customer Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Company</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.company || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Platform</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.platform || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Service</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.serviceCategory || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.budget || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Timeline</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.timeline || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Website</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.website || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Priority</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                              {selectedTicket.priority}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Hosting Requirements</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.hostingNeeds || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description</h4>
                        <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description}</p>
                      </div>

                      {/* Proposal Amount */}
                      <div className={`rounded-lg p-4 border-2 ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      }`}>
                        <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Proposal Amount
                        </h4>
                        {selectedTicket.proposalAmount ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${selectedTicket.proposalAmount.toLocaleString()}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Customer can view this in their portal
                              </p>
                            </div>
                            <button
                              onClick={() => setProposalInput(selectedTicket.proposalAmount?.toString() || '')}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                              <input
                                type="number"
                                value={proposalInput}
                                onChange={(e) => setProposalInput(e.target.value)}
                                placeholder="Enter proposal amount"
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm ${
                                  theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (proposalInput && parseFloat(proposalInput) > 0) {
                                  updateProposalAmount(selectedTicket.id, parseFloat(proposalInput));
                                  setProposalInput('');
                                }
                              }}
                              disabled={!proposalInput || parseFloat(proposalInput) <= 0}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save Proposal
                            </button>
                          </div>
                        )}
                        {proposalInput && selectedTicket.proposalAmount && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="relative flex-1">
                              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                              <input
                                type="number"
                                value={proposalInput}
                                onChange={(e) => setProposalInput(e.target.value)}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm ${
                                  theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (proposalInput && parseFloat(proposalInput) > 0) {
                                  updateProposalAmount(selectedTicket.id, parseFloat(proposalInput));
                                  setProposalInput('');
                                }
                              }}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setProposalInput('')}
                              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status Update */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['open', 'in-progress', 'pending-payment', 'completed', 'closed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateTicketStatus(selectedTicket.id, status, 'project')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTicket.status === status
                                  ? 'bg-blue-600 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message Area */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Send Message to Customer</h4>
                        <textarea
                          className={`w-full px-3 py-2 border rounded-lg placeholder-gray-500 text-sm resize-none ${
                            theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          rows={3}
                          placeholder="Type your message to the customer..."
                        />
                        <div className="flex justify-end mt-2">
                          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all">
                            Send Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-xl border flex items-center justify-center min-h-[400px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Select a request to view details</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'all-support':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Support Tickets</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{supportTickets.length} total tickets</span>
              </div>
            </div>

            {supportTickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No support tickets yet</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Customer support tickets will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket List */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Support Tickets</h3>
                  </div>
                  <div className={`divide-y max-h-[600px] overflow-y-auto ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {supportTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full p-4 text-left transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                            : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber || ticket.id}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.issueType || 'Support Request'}</p>
                        <p className="text-xs text-gray-500 mt-1">{ticket.company || ticket.name} • {formatDate(ticket.createdAt)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Detail */}
                {selectedTicket ? (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.ticketNumber || selectedTicket.id}</h3>
                      <div className="flex items-center gap-2">
                        {/* Refresh Button */}
                        <button
                          onClick={handleRefreshTicket}
                          disabled={refreshing}
                          className={`p-2 rounded-lg transition-all ${
                            theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                          } ${refreshing ? 'animate-spin' : ''}`}
                          title="Refresh ticket data"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                      {/* Customer Info */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Customer Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{(selectedTicket as any).phone || (selectedTicket as any).contactPhone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Company</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.company || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Website</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.website || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Customer Type</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {selectedTicket.customerType ? (
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  selectedTicket.customerType === 'returning'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {selectedTicket.customerType === 'returning' ? 'Returning Customer' : 'New Customer'}
                                </span>
                              ) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Related Project</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                              {selectedTicket.relatedProjectId ? (
                                (() => {
                                  const project = tickets.find(t => t.id === selectedTicket.relatedProjectId);
                                  return project ? (
                                    <span className="text-cyan-500">{project.ticketNumber} - {project.company || project.name}</span>
                                  ) : selectedTicket.relatedProjectId;
                                })()
                              ) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(selectedTicket.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Issue Details */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Issue Details</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-500 text-xs">Issue Type</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.issueType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Affected Area</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).affectedArea || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Priority/Severity</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).priority || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Browser</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).browser || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-gray-500 text-xs">Error Message</p>
                          {(selectedTicket as any).errorMessage ? (
                            <p className={`text-sm mt-1 font-mono p-2 rounded ${theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50'}`}>{(selectedTicket as any).errorMessage}</p>
                          ) : (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>N/A</p>
                          )}
                        </div>
                        <div className="mb-3">
                          <p className="text-gray-500 text-xs">Steps to Reproduce</p>
                          <p className={`text-sm mt-1 whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description || (selectedTicket as any).stepsToReproduce || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-gray-500 text-xs">Expected Behavior</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).expectedBehavior || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Actual Behavior</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).actualBehavior || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-gray-500 text-xs">Screenshot/Video URL</p>
                          {(selectedTicket as any).screenshot ? (
                            <a href={(selectedTicket as any).screenshot} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{(selectedTicket as any).screenshot}</a>
                          ) : (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>N/A</p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Additional Information</p>
                          <p className={`text-sm mt-1 whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).additionalInfo || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['open', 'in-progress', 'waiting-customer', 'resolved', 'closed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateTicketStatus(selectedTicket.id, status, 'support')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTicket.status === status
                                  ? 'bg-cyan-600 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Proposal Amount */}
                      <div className={`rounded-lg p-4 border-2 ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      }`}>
                        <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Proposal Amount
                        </h4>
                        {selectedTicket.proposalAmount ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${selectedTicket.proposalAmount.toLocaleString()}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Customer can view this in their portal
                              </p>
                            </div>
                            <button
                              onClick={() => setSupportProposalInput(selectedTicket.proposalAmount?.toString() || '')}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                              <input
                                type="number"
                                value={supportProposalInput}
                                onChange={(e) => setSupportProposalInput(e.target.value)}
                                placeholder="Enter proposal amount"
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm ${
                                  theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (supportProposalInput && parseFloat(supportProposalInput) > 0) {
                                  updateSupportProposalAmount(selectedTicket.id, parseFloat(supportProposalInput));
                                  setSupportProposalInput('');
                                }
                              }}
                              disabled={!supportProposalInput || parseFloat(supportProposalInput) <= 0}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save Proposal
                            </button>
                          </div>
                        )}
                        {supportProposalInput && selectedTicket.proposalAmount && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="relative flex-1">
                              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                              <input
                                type="number"
                                value={supportProposalInput}
                                onChange={(e) => setSupportProposalInput(e.target.value)}
                                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm ${
                                  theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-white border-gray-200 text-gray-900'
                                }`}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if (supportProposalInput && parseFloat(supportProposalInput) > 0) {
                                  updateSupportProposalAmount(selectedTicket.id, parseFloat(supportProposalInput));
                                  setSupportProposalInput('');
                                }
                              }}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setSupportProposalInput('')}
                              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Conversation Area */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Conversation</h4>

                        {/* Conversation messages */}
                        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                          {/* Original ticket description */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 text-sm font-medium flex-shrink-0">
                              {selectedTicket.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{selectedTicket.name || 'Customer'} • {formatDate(selectedTicket.createdAt)}</p>
                            </div>
                          </div>

                          {/* Comments/Replies */}
                          {ticketComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                                comment.userRole === 'admin'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-blue-500/20 text-blue-500'
                              }`}>
                                {comment.userName?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className={`rounded-lg p-3 ${
                                  comment.userRole === 'admin'
                                    ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                                    : theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'
                                }`}>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comment.message}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {comment.userName} {comment.userRole === 'admin' && <span className="text-green-500">(Support)</span>} • {formatDate(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply input */}
                        <div className={`border-t pt-3 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg placeholder-gray-500 text-sm resize-none ${
                              theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                            }`}
                            rows={3}
                            placeholder="Type your reply..."
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleSendReply(selectedTicket.id)}
                              disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingReply ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-xl border flex items-center justify-center min-h-[400px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Select a ticket to view conversation</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Users & Accounts</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{registeredUsers.length} registered users</span>
              </div>
            </div>

            {registeredUsers.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No registered users yet</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Users who register will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User List */}
                <div className={`lg:col-span-1 rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Users</h3>
                  </div>
                  <div className={`divide-y max-h-[600px] overflow-y-auto ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {registeredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setEditingUser(null); }}
                        className={`w-full p-4 text-left transition-all ${
                          selectedUser?.id === u.id
                            ? 'bg-blue-500/10 border-l-4 border-blue-500'
                            : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                            u.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{u.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                u.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                u.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {u.status}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{u.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{u.company || 'No company'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Detail / Edit Panel */}
                <div className="lg:col-span-2">
                  {selectedUser ? (
                    <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            selectedUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedUser.name}</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {!editingUser && (
                            <>
                              <button
                                onClick={() => setEditingUser({...selectedUser})}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                              >
                                Edit User
                              </button>
                              <button
                                onClick={() => handleLoginAsUser(selectedUser.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                  theme === 'dark' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                              >
                                Login as User
                              </button>
                              <button
                                onClick={() => setShowPasswordReset(true)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                  theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                }`}
                              >
                                Reset Password
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteUser(selectedUser.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                              theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {editingUser ? (
                          /* Edit Form */
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                                <input
                                  type="text"
                                  value={editingUser.name}
                                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                                <input
                                  type="email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Company</label>
                                <input
                                  type="text"
                                  value={editingUser.company || ''}
                                  onChange={(e) => setEditingUser({...editingUser, company: e.target.value})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                                <input
                                  type="tel"
                                  value={editingUser.phone || ''}
                                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
                                <select
                                  value={editingUser.role}
                                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'customer'})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                >
                                  <option value="customer">Customer</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                                <select
                                  value={editingUser.status}
                                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value as 'active' | 'inactive' | 'suspended'})}
                                  className={`w-full px-4 py-3 border rounded-lg ${
                                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                  }`}
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="suspended">Suspended</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Admin Notes</label>
                              <textarea
                                value={editingUser.notes || ''}
                                onChange={(e) => setEditingUser({...editingUser, notes: e.target.value})}
                                rows={3}
                                className={`w-full px-4 py-3 border rounded-lg resize-none ${
                                  theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                                }`}
                                placeholder="Internal notes about this user..."
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => updateUser(editingUser)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                                  theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Details */
                          <div className="space-y-6">
                            {/* User Info Grid */}
                            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                              <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Account Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Company</p>
                                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedUser.company || 'Not set'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Phone</p>
                                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedUser.phone || 'Not set'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Role</p>
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {selectedUser.role}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-gray-500">Status</p>
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    selectedUser.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {selectedUser.status}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-gray-500">Registered</p>
                                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(selectedUser.createdAt)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Last Login</p>
                                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Admin Notes */}
                            {selectedUser.notes && (
                              <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Admin Notes</h4>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedUser.notes}</p>
                              </div>
                            )}

                            {/* User Activity */}
                            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                              <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>User Activity</h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {tickets.filter(t => t.email === selectedUser.email).length}
                                  </p>
                                  <p className="text-xs text-gray-500">Projects</p>
                                </div>
                                <div>
                                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {supportTickets.filter(t => t.email === selectedUser.email).length}
                                  </p>
                                  <p className="text-xs text-gray-500">Support Tickets</p>
                                </div>
                                <div>
                                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {invoices.filter(i => i.status === 'paid').length}
                                  </p>
                                  <p className="text-xs text-gray-500">Invoices Paid</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-xl border flex items-center justify-center min-h-[400px] ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Select a user to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-900 border-r border-white/10' : 'bg-white border-r border-gray-200'
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Zenweb</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role === 'admin' ? 'Admin Portal' : 'Client Portal'}</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as NavSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? theme === 'dark'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-gray-900 text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Menu */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-900'}`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className={`sticky top-0 z-10 backdrop-blur-sm px-8 py-4 ${
          theme === 'dark' ? 'bg-gray-950/95 border-b border-white/10' : 'bg-white/95 border-b border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {navItems.find(i => i.id === activeSection)?.label}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, {user?.name}</p>
              </div>
            </div>
            {user?.role !== 'admin' && (
              <div className="flex items-center gap-4">
                <Link
                  href="/#submit-ticket"
                  className={`px-4 py-2 font-medium rounded-lg hover:shadow-lg transition-all ${
                    theme === 'dark' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  + New Project
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Password Reset Modal */}
      {showPasswordReset && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-gray-900 border border-white/10' : 'bg-white shadow-xl'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Reset Password for {selectedUser.name}
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter a new password for this user. They will need to use this password to login.
            </p>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 border rounded-lg ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePasswordReset}
                disabled={passwordResetLoading || !newPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {passwordResetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                onClick={() => { setShowPasswordReset(false); setNewPassword(''); }}
                className={`px-4 py-3 font-semibold rounded-lg transition-all ${
                  theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
