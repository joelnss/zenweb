'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SupportTicketForm from '@/components/portal/SupportTicketForm';
import { getAllTickets as getAllTicketsAPI, updateTicket as updateTicketAPI, createTicket as createTicketAPI, Ticket as ZenwebTicket, getTicketComments, addTicketComment, TicketComment, createPaymentCheckout, verifyPayment } from '@/lib/api/tickets';
import { getAllUsers } from '@/lib/data/users';
import { getAllUsers as getAllUsersAPI, impersonateUser, resetUserPassword, getSettings, updateSettings, testSmsNotification, Settings, createUser, CreateUserInput, createProject, CreateProjectInput, PROJECT_TYPES, User, getAllProjects, Project, updateProject } from '@/lib/api/admin';
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
  subject?: string;
  type?: string;
  proposalAmount?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  paidAt?: string;
  customerType?: 'new' | 'returning';
  relatedProjectId?: string;
  cost?: number;
  invoiceApproved?: boolean;
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

type NavSection = 'overview' | 'projects' | 'support' | 'invoices' | 'company' | 'team' | 'settings' | 'all-requests' | 'all-support' | 'archived' | 'users' | 'analytics';

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

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<Ticket | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [portalProjectSearch, setPortalProjectSearch] = useState('');
  const [portalSupportSearch, setPortalSupportSearch] = useState('');
  const [selectedPortalProject, setSelectedPortalProject] = useState<Ticket | null>(null);
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

  // Admin create modals state
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // Ticket subject editing state
  const [editingSubject, setEditingSubject] = useState(false);
  const [editSubjectValue, setEditSubjectValue] = useState('');
  const [savingSubject, setSavingSubject] = useState(false);

  // Project association state
  const [updatingProjectAssociation, setUpdatingProjectAssociation] = useState(false);

  // Project editing state (admin only)
  const [editingProject, setEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState<{
    projectName?: string;
    name?: string;
    company?: string;
    website?: string;
    description?: string;
    budget?: string;
    timeline?: string;
  }>({});
  const [savingProject, setSavingProject] = useState(false);

  // New user form state
  const [newUserForm, setNewUserForm] = useState<CreateUserInput>({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: '',
    role: 'user',
  });

  // New ticket form state
  const [newTicketForm, setNewTicketForm] = useState({
    userId: '',
    requestType: 'technical_issue' as 'new_project' | 'technical_issue' | 'enhancement',
    subject: '',
    description: '',
    priority: 'normal',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactCompany: '',
  });

  // New project form state
  const [newProjectForm, setNewProjectForm] = useState<CreateProjectInput>({
    userId: '',
    name: '',
    type: 'new_website',
    description: '',
    timeline: '',
    budgetRange: '',
    website: '',
  });

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

  // Handle saving ticket subject
  const handleSaveSubject = async (ticketId: string) => {
    if (!editSubjectValue.trim()) {
      alert('Please enter a ticket name');
      return;
    }
    setSavingSubject(true);
    const result = await updateTicketAPI(ticketId, { subject: editSubjectValue.trim() });
    setSavingSubject(false);
    if (result.success) {
      // Update the selected ticket with the new subject
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, subject: editSubjectValue.trim() });
      }
      setEditingSubject(false);
      await loadTickets();
    } else {
      alert(result.message || 'Failed to update ticket name');
    }
  };

  // Handle updating project association for a support ticket
  const handleUpdateProjectAssociation = async (ticketId: string, projectId: string | null) => {
    setUpdatingProjectAssociation(true);
    const result = await updateTicketAPI(ticketId, { relatedProjectId: projectId });
    setUpdatingProjectAssociation(false);
    if (result.success) {
      // Update the selected ticket with the new project association
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, relatedProjectId: projectId || undefined });
      }
      await loadTickets();
    } else {
      alert(result.message || 'Failed to update project association');
    }
  };

  // Handle saving project edits (admin only)
  const handleSaveProject = async () => {
    if (!selectedTicket) return;
    setSavingProject(true);

    // Use appropriate API based on item type
    let result;
    if (selectedTicket.id.startsWith('proj_')) {
      result = await updateProject(selectedTicket.id, {
        name: editProjectData.projectName,
        website: editProjectData.website,
        description: editProjectData.description,
        timeline: editProjectData.timeline,
        budgetRange: editProjectData.budget,
      });
    } else {
      result = await updateTicketAPI(selectedTicket.id, {
        contactName: editProjectData.name,
        contactCompany: editProjectData.company,
        website: editProjectData.website,
        description: editProjectData.description,
        timeline: editProjectData.timeline,
        budget: editProjectData.budget,
      });
    }

    setSavingProject(false);
    if (result.success) {
      setEditingProject(false);
      setEditProjectData({});
      await loadTickets();
      // Refresh selected ticket
      const updatedTickets = await getAllTicketsAPI();
      const updatedProjects = await getAllProjects();
      const combined = [...updatedTickets, ...updatedProjects];
      const updated = combined.find(t => t.id === selectedTicket.id);
      if (updated) {
        // Map to Ticket format for display
        setSelectedTicket({
          ...selectedTicket,
          name: editProjectData.name || selectedTicket.name,
          company: editProjectData.company || selectedTicket.company,
          website: editProjectData.website || selectedTicket.website,
          description: editProjectData.description || selectedTicket.description,
          timeline: editProjectData.timeline || selectedTicket.timeline,
          budget: editProjectData.budget || selectedTicket.budget,
        });
      }
    } else {
      alert(result.message || 'Failed to save project');
    }
  };

  // Start editing project with current values
  const startEditingProject = () => {
    if (!selectedTicket) return;
    setEditProjectData({
      projectName: selectedTicket.serviceCategory || selectedTicket.company || '',
      name: selectedTicket.name || '',
      company: selectedTicket.company || '',
      website: selectedTicket.website || '',
      description: selectedTicket.description || '',
      budget: selectedTicket.budget || '',
      timeline: selectedTicket.timeline || '',
    });
    setEditingProject(true);
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
      setTestResult(`Success! Ticket ${result.ticket?.ticketNumber} created. Check "Support Tickets" to see it.`);
      setTimeout(() => setTestResult(null), 5000);
    } else {
      setTestResult(`Error: ${result.message}`);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // Load comments for a ticket (admin view - projects & support tickets)
  const loadTicketComments = async (ticketId: string) => {
    console.log('[Admin Conversation] loadTicketComments called for:', ticketId);
    try {
      const comments = await getTicketComments(ticketId);
      console.log('[Admin Conversation] API returned comments:', comments.length, comments);
      setTicketComments(comments);
    } catch (error) {
      console.error('[Admin Conversation] Error loading comments:', error);
    }
  };

  // Send a reply/comment on a ticket (admin view)
  const handleSendReply = async (ticketId: string) => {
    console.log('[Admin Conversation] handleSendReply called for:', ticketId, 'message:', replyText);
    if (!replyText.trim()) {
      console.log('[Admin Conversation] Empty message, returning');
      return;
    }

    setSendingReply(true);
    try {
      const result = await addTicketComment(ticketId, {
        userId: user?.id || null,
        userName: user?.name || user?.email || 'Anonymous',
        userRole: user?.role === 'admin' ? 'admin' : 'user',
        message: replyText.trim(),
      });

      console.log('[Admin Conversation] Reply result:', result);

      if (result.success) {
        setReplyText('');
        await loadTicketComments(ticketId);
      } else {
        console.error('[Admin Conversation] Failed to send reply:', result.message);
        alert('Failed to send reply: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('[Admin Conversation] Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    }
    setSendingReply(false);
  };

  // Debug function to refresh from API
  const handleDebugRefresh = async () => {
    setTestResult('Fetching from backend API...');

    try {
      const allTickets = await getAllTicketsAPI();
      const supportCount = allTickets.filter((t: ZenwebTicket) => t.requestType === 'technical_issue' || t.requestType === 'enhancement').length;
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

  // Load API users for dropdowns
  const loadApiUsers = async () => {
    const users = await getAllUsersAPI();
    setApiUsers(users);
  };

  // Handle create new user
  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name) {
      alert('Please fill in all required fields (email, password, name)');
      return;
    }
    setCreatingUser(true);
    const result = await createUser(newUserForm);
    setCreatingUser(false);

    if (result.success) {
      alert(result.message);
      setShowNewUserModal(false);
      setNewUserForm({ email: '', password: '', name: '', company: '', phone: '', role: 'user' });
      loadApiUsers();
      loadUsers();
    } else {
      alert(result.message || 'Failed to create user');
    }
  };

  // Handle create new ticket
  const handleCreateTicket = async () => {
    if (!newTicketForm.subject) {
      alert('Please provide a ticket name');
      return;
    }
    if (!newTicketForm.description) {
      alert('Please provide a description');
      return;
    }
    setCreatingTicket(true);

    // Get user info if userId is selected
    const selectedUserData = apiUsers.find(u => u.id === newTicketForm.userId);

    const result = await createTicketAPI({
      userId: newTicketForm.userId || null,
      requestType: newTicketForm.requestType,
      subject: newTicketForm.subject,
      description: newTicketForm.description,
      priority: newTicketForm.priority,
      contactName: newTicketForm.contactName || selectedUserData?.name || '',
      contactEmail: newTicketForm.contactEmail || selectedUserData?.email || '',
      contactPhone: newTicketForm.contactPhone || selectedUserData?.phone || '',
      contactCompany: newTicketForm.contactCompany || selectedUserData?.company || '',
    });
    setCreatingTicket(false);

    if (result.success) {
      alert(`Ticket ${result.ticket?.ticketNumber} created successfully!`);
      setShowNewTicketModal(false);
      setNewTicketForm({
        userId: '',
        requestType: 'technical_issue',
        subject: '',
        description: '',
        priority: 'normal',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactCompany: '',
      });
      loadTickets();
    } else {
      alert(result.message || 'Failed to create ticket');
    }
  };

  // Handle create new project
  const handleCreateProject = async () => {
    // For customers, use their own user ID
    const projectUserId = user?.role === 'admin' ? newProjectForm.userId : user?.id;

    if (!projectUserId || !newProjectForm.name || !newProjectForm.description) {
      alert('Please fill in required fields (name, description)');
      return;
    }
    setCreatingProject(true);
    const result = await createProject({ ...newProjectForm, userId: projectUserId });
    setCreatingProject(false);

    if (result.success) {
      alert('Project created successfully!');
      setShowNewProjectModal(false);
      setNewProjectForm({
        userId: '',
        name: '',
        type: 'new_website',
        description: '',
        timeline: '',
        budgetRange: '',
        website: '',
      });
      loadTickets();
    } else {
      alert(result.message || 'Failed to create project');
    }
  };

  // Handle user selection change for ticket/project forms
  const handleUserSelectChange = (userId: string, formType: 'ticket' | 'project') => {
    const selectedUserData = apiUsers.find(u => u.id === userId);
    if (formType === 'ticket') {
      setNewTicketForm(prev => ({
        ...prev,
        userId,
        contactName: selectedUserData?.name || prev.contactName,
        contactEmail: selectedUserData?.email || prev.contactEmail,
        contactPhone: selectedUserData?.phone || prev.contactPhone,
        contactCompany: selectedUserData?.company || prev.contactCompany,
      }));
    } else {
      setNewProjectForm(prev => ({ ...prev, userId }));
    }
  };

  // Invoice state - projects act as invoices containing tickets
  const [selectedInvoiceProject, setSelectedInvoiceProject] = useState<Ticket | null>(null);
  const [ticketCostInput, setTicketCostInput] = useState<string>('');
  const [updatingTicketCost, setUpdatingTicketCost] = useState<string | null>(null);
  // Venmo URL for payments - will be set by user
  const venmoUrl = 'venmo://paycharge?txn=pay&recipients=VENMO_USERNAME&amount=AMOUNT&note=INVOICE_NOTE';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Set sidebar closed by default on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setSidebarOpen(!isMobile);

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
      loadUsers();
      loadApiUsers();
      if (user?.role === 'admin') {
        loadSmsSettings();
      }
    }
  }, [isAuthenticated, user]);

  // Load comments when a ticket is selected (admin view)
  useEffect(() => {
    if (selectedTicket) {
      loadTicketComments(selectedTicket.id);
      setReplyText('');
    } else {
      setTicketComments([]);
    }
  }, [selectedTicket]);

  // Load messages when a support ticket is selected (customer portal view)
  useEffect(() => {
    console.log('[Conversation] selectedSupportTicket changed:', selectedSupportTicket?.id);
    if (selectedSupportTicket) {
      console.log('[Conversation] Loading messages for ticket:', selectedSupportTicket.id);
      loadMessages(selectedSupportTicket.id);
      setNewMessage('');
    } else {
      console.log('[Conversation] Clearing messages');
      setMessages([]);
    }
  }, [selectedSupportTicket]);

  // Handle URL-based deep linking to specific projects/tickets
  useEffect(() => {
    const projectId = searchParams.get('project');
    const ticketId = searchParams.get('ticket');

    if (projectId && tickets.length > 0) {
      // Find project in tickets list
      const project = tickets.find(t => t.id === projectId || t.ticketNumber === projectId);
      if (project) {
        if (user?.role === 'admin') {
          setActiveSection('all-requests');
          setSelectedTicket(project);
        } else {
          setActiveSection('projects');
          setSelectedPortalProject(project);
        }
      }
    } else if (ticketId && supportTickets.length > 0) {
      // Find ticket in support tickets list
      const ticket = supportTickets.find(t => t.id === ticketId || t.ticketNumber === ticketId);
      if (ticket) {
        if (user?.role === 'admin') {
          setActiveSection('all-support');
          setSelectedTicket(ticket);
        } else {
          setActiveSection('support');
          setSelectedSupportTicket(ticket);
        }
      }
    }
  }, [searchParams, tickets, supportTickets, user]);

  // Function to update URL when selecting an item
  const updateUrlWithItem = (type: 'project' | 'ticket', id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    // Clear both params first
    params.delete('project');
    params.delete('ticket');

    if (id) {
      params.set(type, id);
    }

    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.replace(newUrl, { scroll: false });
  };

  const loadTickets = async () => {
    // Load all tickets from backend API
    const allZenwebTickets = await getAllTicketsAPI();
    const allProjects = await getAllProjects();
    const allUsers = getAllUsers();

    // Debug logging
    console.log('=== LOAD TICKETS DEBUG ===');
    console.log('All tickets from API:', allZenwebTickets);
    console.log('All projects from API:', allProjects);
    console.log('Total tickets count:', allZenwebTickets.length);
    console.log('Total projects count:', allProjects.length);
    console.log('Current user:', user);
    console.log('User role:', user?.role);

    // Separate project requests and support tickets based on requestType
    const projectRequests = allZenwebTickets.filter(t => t.requestType === 'new_project');
    const supportRequests = allZenwebTickets.filter(t => t.requestType === 'technical_issue' || t.requestType === 'enhancement');

    console.log('Project requests from tickets:', projectRequests.length);
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
        subject: t.subject,
        type: t.requestType,
        proposalAmount: t.proposalAmount,
        paymentStatus: t.paymentStatus as 'unpaid' | 'paid' | 'pending',
        paidAt: t.paidAt,
        relatedProjectId: t.relatedProjectId || undefined,
        cost: t.cost || 0,
      };
    };

    // Map projects from projects API to dashboard Ticket format
    const mapProjectToTicket = (p: Project): Ticket => {
      const projectUser = allUsers.find(u => u.id === p.userId);
      return {
        id: p.id,
        ticketNumber: p.id,
        name: projectUser?.name || p.name || '',
        email: projectUser?.email || '',
        phone: projectUser?.phone || '',
        company: projectUser?.company || p.name || '',
        website: p.website || '',
        platform: p.type || '',
        serviceCategory: p.name || '',
        description: p.description || '',
        priority: 'medium',
        status: p.status === 'new' ? 'open' : p.status,
        userId: p.userId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        type: 'new_project',
        timeline: p.timeline || '',
        budget: p.budgetRange || '',
        invoiceApproved: p.invoiceApproved === 1,
      };
    };

    if (user?.role === 'admin') {
      // Admin sees all tickets and projects
      console.log('Admin branch - setting ALL tickets and projects');
      // Projects view only shows actual projects (proj_ IDs) from projects API
      const apiProjects = allProjects.map(mapProjectToTicket);
      console.log('Setting project items:', apiProjects.length);
      // Support tickets includes all tickets (tkt_ IDs) - both support and project requests
      const allSupportTickets = [...supportRequests, ...projectRequests].map(mapToTicket);
      console.log('Setting support tickets:', allSupportTickets.length);
      setTickets(apiProjects);
      setSupportTickets(allSupportTickets);
    } else {
      console.log('Customer branch - filtering by user');
      // Customer sees only their own projects (proj_ IDs only)
      const userProjects = allProjects.filter(p => p.userId === user?.id);
      setTickets(userProjects.map(mapProjectToTicket));

      // Customer sees all their tickets (both support and project requests)
      const userTickets = [...supportRequests, ...projectRequests].filter(t => t.userId === user?.id || t.contactEmail === user?.email);
      setSupportTickets(userTickets.map(mapToTicket));
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, ticketType: 'project' | 'support') => {
    // Use the appropriate API based on item type
    // Projects have IDs starting with 'proj_', tickets start with 'tkt_'
    if (ticketId.startsWith('proj_')) {
      await updateProject(ticketId, { status: newStatus });
    } else {
      await updateTicketAPI(ticketId, { status: newStatus });
    }
    // Reload tickets to get updated data
    await loadTickets();
    setSelectedTicket(null);
  };

  // Update proposal amount for a project request
  const updateProposalAmount = async (ticketId: string, amount: number) => {
    // Save to backend API - use appropriate endpoint based on item type
    if (ticketId.startsWith('proj_')) {
      // Projects don't have proposalAmount field yet, use tickets API for now
      await updateTicketAPI(ticketId, { proposalAmount: amount });
    } else {
      await updateTicketAPI(ticketId, { proposalAmount: amount });
    }
    // Reload tickets to get updated data
    await loadTickets();
    // Update the selected ticket as well
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, proposalAmount: amount });
    }
  };

  // Update ticket amount (for invoice line items) - saves to proposalAmount field
  const updateTicketCost = async (ticketId: string, amount: number) => {
    setUpdatingTicketCost(ticketId);
    try {
      await updateTicketAPI(ticketId, { proposalAmount: amount });
      // Reload tickets to get updated data
      await loadTickets();
      // Update selected ticket if it matches
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, proposalAmount: amount });
      }
      setTicketCostInput('');
    } catch (error) {
      console.error('Error updating ticket amount:', error);
    }
    setUpdatingTicketCost(null);
  };

  // Calculate invoice total from linked tickets (uses proposalAmount set by admin)
  const calculateInvoiceTotal = (projectId: string): number => {
    return supportTickets
      .filter(t => t.relatedProjectId === projectId)
      .reduce((sum, t) => sum + (t.proposalAmount || 0), 0);
  };

  // Get invoice payment status based on tickets
  const getInvoiceStatus = (projectId: string): 'unpaid' | 'partial' | 'paid' => {
    const linkedTickets = supportTickets.filter(t => t.relatedProjectId === projectId);
    if (linkedTickets.length === 0) return 'unpaid';
    const paidTickets = linkedTickets.filter(t => t.paymentStatus === 'paid');
    if (paidTickets.length === linkedTickets.length) return 'paid';
    if (paidTickets.length > 0) return 'partial';
    return 'unpaid';
  };

  // Generate Venmo payment link
  const generateVenmoLink = (amount: number, note: string): string => {
    // Venmo deep link format - user will provide their username
    const encodedNote = encodeURIComponent(note);
    return `venmo://paycharge?txn=pay&amount=${amount}&note=${encodedNote}`;
  };

  // Approve/unapprove invoice (admin only)
  const toggleInvoiceApproval = async (projectId: string, approve: boolean) => {
    try {
      await updateProject(projectId, { invoiceApproved: approve ? 1 : 0 } as Partial<Project>);
      // Reload to get updated data
      await loadTickets();
      // Update selected invoice project if it matches
      if (selectedInvoiceProject && selectedInvoiceProject.id === projectId) {
        setSelectedInvoiceProject({ ...selectedInvoiceProject, invoiceApproved: approve });
      }
    } catch (error) {
      console.error('Error updating invoice approval:', error);
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
    console.log('[Conversation] loadMessages called for:', ticketId);
    try {
      const comments = await getTicketComments(ticketId);
      console.log('[Conversation] API returned comments:', comments.length, comments);
      // Transform API comments to Message format for customer view
      const formattedMessages: Message[] = comments.map(c => ({
        id: c.id,
        ticketId: c.ticketId,
        sender: c.userRole === 'admin' ? 'support' : 'user',
        senderName: c.userRole === 'admin' ? 'Support Team' : c.userName,
        content: c.message,
        createdAt: c.createdAt,
      }));
      console.log('[Conversation] Setting messages:', formattedMessages.length);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('[Conversation] Error loading messages:', error);
    }
  };

  // Send a new message - now uses API
  const sendMessage = async (ticketId: string) => {
    console.log('[Conversation] sendMessage called for:', ticketId, 'message:', newMessage);
    if (!newMessage.trim()) {
      console.log('[Conversation] Empty message, returning');
      return;
    }

    try {
      const result = await addTicketComment(ticketId, {
        userId: user?.id || null,
        userName: user?.name || user?.email || 'Customer',
        userRole: user?.role === 'admin' ? 'admin' : 'user',
        message: newMessage.trim(),
      });

      console.log('[Conversation] sendMessage result:', result);

      if (result.success) {
        setNewMessage('');
        // Reload messages to get the new one
        await loadMessages(ticketId);
      } else {
        console.error('[Conversation] Failed to send:', result.message);
        alert('Failed to send message: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('[Conversation] Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  // Select a support ticket and load its messages
  const selectSupportTicket = (ticket: Ticket) => {
    setSelectedSupportTicket(ticket);
    loadMessages(ticket.id);
    updateUrlWithItem('ticket', ticket.id);
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
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'all-requests', label: 'Project Requests', icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'all-support', label: 'Support Tickets', icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'users', label: 'Users & Accounts', icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ];

  // Customer navigation items
  const customerNavItems = [
    { id: 'overview', label: 'Dashboard', icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'projects', label: 'Projects', icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { id: 'support', label: 'Support Tickets', icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'invoices', label: 'Invoices & Billing', icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'company', label: 'Company Profile', icon: (
      <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { id: 'team', label: 'Team & Users', icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'settings', label: 'Account Settings', icon: (
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <button
                  onClick={() => setActiveSection('all-requests')}
                  className={`rounded-xl p-6 border text-left transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
                >
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
                </button>

                <button
                  onClick={() => setActiveSection('all-requests')}
                  className={`rounded-xl p-6 border text-left transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
                >
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
                </button>

                <button
                  onClick={() => setActiveSection('all-support')}
                  className={`rounded-xl p-6 border text-left transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
                >
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
                </button>

                <button
                  onClick={() => setActiveSection('users')}
                  className={`rounded-xl p-6 border text-left transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Registered Users</p>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{registeredUsers.length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
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
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.ticketNumber || ticket.id}</span>
                                {ticket.type === 'enhancement' && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    Enhancement
                                  </span>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.subject || ticket.issueType || 'Support Request'}</p>
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
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{ticket.ticketNumber || ticket.id}</span>
                              {ticket.type === 'enhancement' && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  Enhancement
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="font-medium text-white">{ticket.subject || ticket.issueType || 'Support Request'}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</p>
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
        const filteredPortalProjects = tickets.filter(t =>
          t.status !== 'archived' && (
            t.name?.toLowerCase().includes(portalProjectSearch.toLowerCase()) ||
            t.ticketNumber?.toLowerCase().includes(portalProjectSearch.toLowerCase()) ||
            t.company?.toLowerCase().includes(portalProjectSearch.toLowerCase())
          )
        ).slice(0, 10);
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Projects</h2>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                + New Project
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No projects yet</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Start a new project request to get started</p>
                <button onClick={() => setShowNewProjectModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg">
                  Start a Project
                </button>
              </div>
            ) : selectedPortalProject ? (
              /* Project Detail View - Replaces list when selected */
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  onClick={() => { setSelectedPortalProject(null); updateUrlWithItem('project', null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Projects
                </button>

                <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {/* Header with ticket number, status, priority, and proposal amount */}
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {selectedPortalProject.serviceCategory || selectedPortalProject.company || 'Unnamed Project'}
                            </h3>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedPortalProject.ticketNumber}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPortalProject.status)}`}>
                                {selectedPortalProject.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPortalProject.priority)}`}>
                                {selectedPortalProject.priority}
                              </span>
                            </div>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{formatDate(selectedPortalProject.createdAt)}</p>
                          </div>
                          {/* Proposal Amount Display (Read-only for customers) */}
                          {selectedPortalProject.proposalAmount && (
                            <div className={`text-right px-4 py-3 rounded-xl ${
                              theme === 'dark'
                                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                                : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                            }`}>
                              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>Proposal Amount</p>
                              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                ${selectedPortalProject.proposalAmount.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Contact Information */}
                        <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Contact Information</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Name</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Company</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.company || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Project Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Platform</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.platform || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Service Category</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.serviceCategory || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Website</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                {selectedPortalProject.website ? (
                                  <a href={selectedPortalProject.website.startsWith('http') ? selectedPortalProject.website : `https://${selectedPortalProject.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {selectedPortalProject.website}
                                  </a>
                                ) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Hosting Requirements</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.hostingNeeds || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Budget & Timeline */}
                        <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Budget & Timeline</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Estimated Budget</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.budget || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Project Timeline</p>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPortalProject.timeline || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Project Description */}
                        <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Project Description</h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{selectedPortalProject.description || 'No description provided'}</p>
                        </div>

                        {/* Associated Support Tickets */}
                        {(() => {
                          const associatedTickets = supportTickets.filter(t => t.relatedProjectId === selectedPortalProject.id);
                          if (associatedTickets.length === 0) return null;
                          return (
                            <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
                              <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Associated Support Tickets ({associatedTickets.length})
                              </h4>
                              <div className="space-y-2">
                                {associatedTickets.map((ticket) => (
                                  <div
                                    key={ticket.id}
                                    className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                          {ticket.subject || ticket.issueType || 'Support Ticket'}
                                        </p>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {ticket.ticketNumber} • {formatDate(ticket.createdAt)}
                                        </p>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

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
                                  defaultValue={selectedPortalProject.proposalAmount || ''}
                                  id={`proposal-${selectedPortalProject.id}`}
                                  className={`w-full pl-7 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                    theme === 'dark'
                                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                                  }`}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`proposal-${selectedPortalProject.id}`) as HTMLInputElement;
                                  const amount = parseFloat(input?.value || '0');
                                  if (!isNaN(amount) && amount > 0) {
                                    updateProposalAmount(selectedPortalProject.id, amount);
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
              </div>
            ) : (
              /* Project List View */
              <>
                {/* Search Bar */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, ticket number, or company..."
                    value={portalProjectSearch}
                    onChange={(e) => setPortalProjectSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  {filteredPortalProjects.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => { setSelectedPortalProject(ticket); updateUrlWithItem('project', ticket.id); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {ticket.serviceCategory || ticket.company || 'Unnamed Project'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          {ticket.proposalAmount && (
                            <span className="text-sm font-medium text-green-400">${ticket.proposalAmount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.ticketNumber} • {formatDate(ticket.createdAt)}</p>
                    </button>
                  ))}
                  {filteredPortalProjects.length === 0 && (
                    <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No projects found</p>
                  )}
                </div>
              </>
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
            ) : selectedSupportTicket ? (
              /* Ticket Detail View - Replaces list when selected */
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedSupportTicket(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Tickets
                </button>

                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
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
                              {selectedSupportTicket.type === 'enhancement' && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  Enhancement
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{selectedSupportTicket.issueType || 'Support Request'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Proposal Amount Display - No click, payment happens on invoice page */}
                            {selectedSupportTicket.proposalAmount && (
                              <div className={`text-right px-4 py-2 rounded-xl ${
                                selectedSupportTicket.paymentStatus === 'paid'
                                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50'
                                  : theme === 'dark'
                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                              }`}>
                                <p className={`text-xs font-medium ${
                                  selectedSupportTicket.paymentStatus === 'paid'
                                    ? 'text-green-400'
                                    : theme === 'dark' ? 'text-green-400' : 'text-green-700'
                                }`}>
                                  {selectedSupportTicket.paymentStatus === 'paid' ? 'Paid' : 'Amount'}
                                </p>
                                <p className={`text-lg font-bold ${
                                  selectedSupportTicket.paymentStatus === 'paid'
                                    ? 'text-green-400'
                                    : theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  ${selectedSupportTicket.proposalAmount.toLocaleString()}
                                </p>
                              </div>
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
                      <div className="flex-1 p-4  space-y-4">
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
              </div>
            ) : (
              /* Ticket List View */
              <>
                {/* Search Bar */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by ticket number or issue type..."
                    value={portalSupportSearch}
                    onChange={(e) => setPortalSupportSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Ticket List */}
                <div className="space-y-3">
                  {supportTickets
                    .filter(t =>
                      t.ticketNumber?.toLowerCase().includes(portalSupportSearch.toLowerCase()) ||
                      t.issueType?.toLowerCase().includes(portalSupportSearch.toLowerCase()) ||
                      t.name?.toLowerCase().includes(portalSupportSearch.toLowerCase())
                    )
                    .filter(t => t.status !== 'archived')
                    .slice(0, 10)
                    .map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => selectSupportTicket(ticket)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.ticketNumber || ticket.id}</span>
                          {ticket.type === 'enhancement' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Enhancement
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          {ticket.proposalAmount && (
                            <span className="text-sm font-medium text-green-400">${ticket.proposalAmount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.subject || ticket.issueType || 'Support Request'}</p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(ticket.createdAt)}</p>
                      {ticket.relatedProjectId && (() => {
                        const relatedProject = tickets.find(t => t.id === ticket.relatedProjectId);
                        if (relatedProject) {
                          return (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {relatedProject.serviceCategory || relatedProject.company || relatedProject.ticketNumber}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'invoices':
        // Projects with linked tickets act as invoices
        const projectsWithTickets = tickets.filter(p => {
          const linkedTickets = supportTickets.filter(t => t.relatedProjectId === p.id);
          return linkedTickets.length > 0 || p.status !== 'archived';
        });

        // Calculate totals (using proposalAmount set by admin)
        const totalPaid = projectsWithTickets.reduce((sum, p) => {
          const linkedTickets = supportTickets.filter(t => t.relatedProjectId === p.id && t.paymentStatus === 'paid');
          return sum + linkedTickets.reduce((s, t) => s + (t.proposalAmount || 0), 0);
        }, 0);

        const totalPending = projectsWithTickets.reduce((sum, p) => {
          const linkedTickets = supportTickets.filter(t => t.relatedProjectId === p.id && t.paymentStatus !== 'paid');
          return sum + linkedTickets.reduce((s, t) => s + (t.proposalAmount || 0), 0);
        }, 0);

        return (
          <div className={`space-y-6 ${theme === 'dark' ? '' : 'text-gray-900'}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              {selectedInvoiceProject ? (
                <button
                  onClick={() => setSelectedInvoiceProject(null)}
                  className={`flex items-center gap-2 font-semibold transition-colors ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Invoices
                </button>
              ) : (
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Invoices & Billing</h2>
              )}
            </div>

            {selectedInvoiceProject ? (
              /* Invoice Detail View */
              <div className="space-y-4">
                {/* Compact Invoice Header Bar */}
                <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedInvoiceProject.serviceCategory || selectedInvoiceProject.company || selectedInvoiceProject.ticketNumber}
                    </span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedInvoiceProject.name || selectedInvoiceProject.email || ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(calculateInvoiceTotal(selectedInvoiceProject.id))}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      getInvoiceStatus(selectedInvoiceProject.id) === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : getInvoiceStatus(selectedInvoiceProject.id) === 'partial'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {getInvoiceStatus(selectedInvoiceProject.id)}
                    </span>
                  </div>
                </div>

                {/* Line Items (Tickets) */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Line Items (Support Tickets)</h4>
                  </div>

                  {(() => {
                    const linkedTickets = supportTickets.filter(t => t.relatedProjectId === selectedInvoiceProject.id);
                    if (linkedTickets.length === 0) {
                      return (
                        <div className="p-8 text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No tickets linked to this project</p>
                          <p className="text-xs text-gray-500 mt-1">Link support tickets to this project to add line items</p>
                        </div>
                      );
                    }

                    return (
                      <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                        {linkedTickets.map((ticket) => (
                          <div key={ticket.id} className={`p-4 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                              {/* Ticket Info - Left */}
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {ticket.ticketNumber || ticket.id}
                                </span>
                                <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {ticket.subject || ticket.issueType || 'Support Request'}
                                </p>
                              </div>
                              {/* Status - Center */}
                              <div className="flex items-center gap-2 w-40 justify-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                                {ticket.paymentStatus === 'paid' && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                    Paid
                                  </span>
                                )}
                              </div>

                              {/* Amount - Right (fixed width) */}
                              <div className="w-28 text-right">
                                {user?.role === 'admin' ? (
                                  updatingTicketCost === ticket.id ? (
                                    <div className="flex items-center gap-1 justify-end">
                                      <div className="relative">
                                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                                        <input
                                          type="number"
                                          value={ticketCostInput}
                                          onChange={(e) => setTicketCostInput(e.target.value)}
                                          className={`w-20 pl-5 pr-1 py-1 text-sm rounded border ${
                                            theme === 'dark'
                                              ? 'bg-white/10 border-white/20 text-white'
                                              : 'bg-white border-gray-300 text-gray-900'
                                          }`}
                                          placeholder="0.00"
                                          autoFocus
                                        />
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (ticketCostInput) {
                                            updateTicketCost(ticket.id, parseFloat(ticketCostInput));
                                          }
                                        }}
                                        className="p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                        title="Save"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => { setUpdatingTicketCost(null); setTicketCostInput(''); }}
                                        className={`p-1 rounded ${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                                        title="Cancel"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setUpdatingTicketCost(ticket.id);
                                        setTicketCostInput(ticket.proposalAmount?.toString() || '');
                                      }}
                                      className={`font-semibold ${
                                        ticket.proposalAmount
                                          ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                                          : theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                      }`}
                                    >
                                      {ticket.proposalAmount ? formatCurrency(ticket.proposalAmount) : 'Set'}
                                    </button>
                                  )
                                ) : (
                                  <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {ticket.proposalAmount ? formatCurrency(ticket.proposalAmount) : '$0.00'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Total Row */}
                        <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(calculateInvoiceTotal(selectedInvoiceProject.id))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Invoice Approval Section (Admin Only) */}
                {user?.role === 'admin' && calculateInvoiceTotal(selectedInvoiceProject.id) > 0 && (
                  <div className={`rounded-xl border p-6 ${
                    selectedInvoiceProject.invoiceApproved
                      ? theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                      : theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold flex items-center gap-2 ${
                          selectedInvoiceProject.invoiceApproved
                            ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                            : theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'
                        }`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {selectedInvoiceProject.invoiceApproved ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                          {selectedInvoiceProject.invoiceApproved ? 'Invoice Approved' : 'Pending Approval'}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedInvoiceProject.invoiceApproved
                            ? 'Customer can now pay this invoice'
                            : 'Approve this invoice to allow customer payment'}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleInvoiceApproval(selectedInvoiceProject.id, !selectedInvoiceProject.invoiceApproved)}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                          selectedInvoiceProject.invoiceApproved
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {selectedInvoiceProject.invoiceApproved ? 'Revoke Approval' : 'Approve Invoice'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Section - Always show button, but disabled unless pending-payment */}
                {calculateInvoiceTotal(selectedInvoiceProject.id) > 0 && getInvoiceStatus(selectedInvoiceProject.id) !== 'paid' && (
                  <div className={`rounded-xl border p-6 ${
                    selectedInvoiceProject.status === 'pending-payment'
                      ? theme === 'dark' ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : theme === 'dark' ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h4 className={`font-semibold mb-4 flex items-center gap-2 ${
                      selectedInvoiceProject.status === 'pending-payment'
                        ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Payment Options
                    </h4>

                    <div className="space-y-3">
                      {/* Venmo Payment Button - Disabled unless pending-payment */}
                      {selectedInvoiceProject.status === 'pending-payment' ? (
                        <a
                          href={generateVenmoLink(
                            calculateInvoiceTotal(selectedInvoiceProject.id),
                            `Invoice: ${selectedInvoiceProject.ticketNumber} - ${selectedInvoiceProject.serviceCategory || selectedInvoiceProject.company || 'Project'}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#008CFF] text-white font-semibold rounded-xl hover:bg-[#0074D4] transition-all shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.27 3c.76 1.26 1.1 2.56 1.1 4.2 0 4.24-3.62 9.77-6.55 13.65H7.55L5.36 3.87l5.87-.55.9 7.16c.84-1.36 1.87-3.49 1.87-4.95 0-1.56-.27-2.6-.69-3.43L19.27 3z"/>
                          </svg>
                          Pay ${calculateInvoiceTotal(selectedInvoiceProject.id).toFixed(2)} with Venmo
                        </a>
                      ) : (
                        <div
                          className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gray-500/50 text-gray-400 font-semibold rounded-xl cursor-not-allowed opacity-60"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.27 3c.76 1.26 1.1 2.56 1.1 4.2 0 4.24-3.62 9.77-6.55 13.65H7.55L5.36 3.87l5.87-.55.9 7.16c.84-1.36 1.87-3.49 1.87-4.95 0-1.56-.27-2.6-.69-3.43L19.27 3z"/>
                          </svg>
                          Pay ${calculateInvoiceTotal(selectedInvoiceProject.id).toFixed(2)} with Venmo
                        </div>
                      )}

                      <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {selectedInvoiceProject.status === 'pending-payment'
                          ? 'Opens Venmo app to complete payment'
                          : 'Payment will be enabled when invoice status is set to "Pending Payment"'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Invoice List View */
              <>
                {/* Balance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Paid</p>
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'}`}>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Outstanding</p>
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {formatCurrency(totalPending)}
                    </p>
                  </div>
                </div>

                {/* Project/Invoice List */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Invoices</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Each project contains linked support tickets as line items
                    </p>
                  </div>

                  {projectsWithTickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No invoices yet</p>
                      <p className="text-xs text-gray-500 mt-1">Projects with linked support tickets will appear here</p>
                    </div>
                  ) : (
                    <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {projectsWithTickets.map((project) => {
                        const linkedTickets = supportTickets.filter(t => t.relatedProjectId === project.id);
                        const total = linkedTickets.reduce((sum, t) => sum + (t.proposalAmount || 0), 0);
                        const status = getInvoiceStatus(project.id);

                        return (
                          <button
                            key={project.id}
                            onClick={() => setSelectedInvoiceProject(project)}
                            className={`w-full p-4 text-left transition-all ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {project.serviceCategory || project.company || 'Project'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    status === 'paid'
                                      ? 'bg-green-500/20 text-green-400'
                                      : status === 'partial'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {status}
                                  </span>
                                  {total > 0 && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      project.status === 'pending-payment'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                      {project.status === 'pending-payment' ? 'ready to pay' : project.status || 'in progress'}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {project.ticketNumber} • {linkedTickets.length} ticket{linkedTickets.length !== 1 ? 's' : ''} • {formatDate(project.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(total)}
                                </span>
                                <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
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
                <div className="p-4 space-y-3 ">
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
                <div className="p-4 space-y-2 ">
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
                <div className="p-4 space-y-3 ">
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
                <div className="p-4 space-y-3 ">
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
        const activeProjects = tickets.filter(t => t.status !== 'archived');
        const filteredProjects = activeProjects.filter(t => {
          if (!projectSearch) return true;
          const search = projectSearch.toLowerCase();
          const name = (t.name || '').toLowerCase();
          const company = (t.company || '').toLowerCase();
          const ticketNum = (t.ticketNumber || t.id || '').toLowerCase();
          return name.includes(search) || company.includes(search) || ticketNum.includes(search);
        }).slice(0, 10);
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Requests</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activeProjects.length} total requests</span>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by customer name or ticket number..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
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
              <div className="space-y-6">
                {/* Project List - Single Column */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    {selectedTicket ? (
                      <button
                        onClick={() => { setSelectedTicket(null); updateUrlWithItem('project', null); }}
                        className={`flex items-center gap-2 font-semibold transition-colors ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Projects
                      </button>
                    ) : (
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Requests</h3>
                    )}
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {selectedTicket ? '1 selected' : `Showing ${filteredProjects.length} of ${tickets.length}`}
                    </span>
                  </div>
                  <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {filteredProjects.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No projects match your search</p>
                      </div>
                    ) : (
                      (selectedTicket ? [selectedTicket] : filteredProjects).map((ticket) => {
                        // Calculate total from linked tickets
                        const linkedTickets = supportTickets.filter(t => t.relatedProjectId === ticket.id);
                        const projectTotal = linkedTickets.reduce((sum, t) => sum + (t.proposalAmount || 0), 0);
                        return (
                        <button
                          key={ticket.id}
                          onClick={() => { setSelectedTicket(ticket); updateUrlWithItem('project', ticket.id); }}
                          className={`w-full p-4 text-left transition-all ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-blue-500/10 border-l-4 border-blue-500'
                              : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.ticketNumber}</span>
                            <div className="flex items-center gap-2">
                              {projectTotal > 0 && (
                                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                  {formatCurrency(projectTotal)}
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.company || ticket.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</p>
                        </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Project Detail - Below List */}
                {selectedTicket ? (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.ticketNumber}</h3>
                        {/* Linked Tickets Count */}
                        {(() => {
                          const linkedTickets = supportTickets.filter(t => t.relatedProjectId === selectedTicket.id);
                          if (linkedTickets.length === 0) return null;
                          return (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              {linkedTickets.length} ticket{linkedTickets.length !== 1 ? 's' : ''}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingProject ? (
                          <>
                            <button
                              onClick={handleSaveProject}
                              disabled={savingProject}
                              className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50"
                            >
                              {savingProject ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingProject(false); setEditProjectData({}); }}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={startEditingProject}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          >
                            Edit Project
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedTicket(null); setEditingProject(false); setEditProjectData({}); updateUrlWithItem('project', null); }}
                          className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 ">
                      {/* Status Update - Moved to Top */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['open', 'in-progress', 'pending-payment', 'completed', 'closed', 'archived'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateTicketStatus(selectedTicket.id, status, 'project')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTicket.status === status
                                  ? status === 'archived' ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conversation Area - Moved to Top */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Conversation</h4>

                        {/* Conversation messages */}
                        <div className="space-y-3 mb-4">
                          {/* Original project description */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 text-sm font-medium flex-shrink-0">
                              {selectedTicket?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket?.description}</p>
                              </div>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{selectedTicket?.name || 'Customer'} • {formatDate(selectedTicket?.createdAt || '')}</p>
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
                                  <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comment.message}</p>
                                </div>
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
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
                            placeholder="Type your message to the customer..."
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleSendReply(selectedTicket!.id)}
                              disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                              {sendingReply ? 'Sending...' : 'Send Message'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Project Name - Editable */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Project Name</h4>
                        {editingProject ? (
                          <input
                            type="text"
                            value={editProjectData.projectName || ''}
                            onChange={(e) => setEditProjectData({...editProjectData, projectName: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border text-lg font-semibold ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            placeholder="Enter project name"
                          />
                        ) : (
                          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTicket.serviceCategory || selectedTicket.company || 'Unnamed Project'}
                          </p>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Customer Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            {editingProject ? (
                              <input
                                type="text"
                                value={editProjectData.name || ''}
                                onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})}
                                className={`w-full px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200'}`}
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.name}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Company</p>
                            {editingProject ? (
                              <input
                                type="text"
                                value={editProjectData.company || ''}
                                onChange={(e) => setEditProjectData({...editProjectData, company: e.target.value})}
                                className={`w-full px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200'}`}
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.company || 'N/A'}</p>
                            )}
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
                            {editingProject ? (
                              <input
                                type="text"
                                value={editProjectData.budget || ''}
                                onChange={(e) => setEditProjectData({...editProjectData, budget: e.target.value})}
                                className={`w-full px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                placeholder="e.g. $5,000 - $10,000"
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.budget || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Timeline</p>
                            {editingProject ? (
                              <input
                                type="text"
                                value={editProjectData.timeline || ''}
                                onChange={(e) => setEditProjectData({...editProjectData, timeline: e.target.value})}
                                className={`w-full px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                placeholder="e.g. 2-4 weeks"
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.timeline || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Website</p>
                            {editingProject ? (
                              <input
                                type="text"
                                value={editProjectData.website || ''}
                                onChange={(e) => setEditProjectData({...editProjectData, website: e.target.value})}
                                className={`w-full px-2 py-1 rounded border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                placeholder="https://example.com"
                              />
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.website || 'N/A'}</p>
                            )}
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
                        {editingProject ? (
                          <textarea
                            value={editProjectData.description || ''}
                            onChange={(e) => setEditProjectData({...editProjectData, description: e.target.value})}
                            rows={5}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            placeholder="Project description..."
                          />
                        ) : (
                          <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description}</p>
                        )}
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

                      {/* Linked Support Tickets Section */}
                      {(() => {
                        const linkedTickets = supportTickets.filter(t => t.relatedProjectId === selectedTicket.id);
                        if (linkedTickets.length === 0) return null;
                        return (
                          <div className={`rounded-lg p-4 border ${theme === 'dark' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                            <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              Linked Support Tickets ({linkedTickets.length})
                            </h4>
                            <div className="space-y-2">
                              {linkedTickets.map((ticket) => (
                                <button
                                  key={ticket.id}
                                  onClick={() => {
                                    setCurrentView('all-support');
                                    setSelectedTicket(ticket);
                                    updateUrlWithItem('ticket', ticket.id);
                                  }}
                                  className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                                    theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {ticket.ticketNumber || ticket.id}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                      </span>
                                    </div>
                                    <p className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {ticket.subject || ticket.issueType || 'Support Request'}
                                    </p>
                                  </div>
                                  <svg className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
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
        const activeTickets = supportTickets.filter(t => t.status !== 'archived');
        const filteredTickets = activeTickets.filter(t => {
          if (!ticketSearch) return true;
          const search = ticketSearch.toLowerCase();
          const name = (t.name || '').toLowerCase();
          const company = (t.company || '').toLowerCase();
          const ticketNum = (t.ticketNumber || t.id || '').toLowerCase();
          return name.includes(search) || company.includes(search) || ticketNum.includes(search);
        }).slice(0, 10);
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Support Tickets</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activeTickets.length} active tickets</span>
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Ticket
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by customer name or ticket number..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {activeTickets.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No support tickets yet</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Customer support tickets will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ticket List - Single Column */}
                <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    {selectedTicket ? (
                      <button
                        onClick={() => { setSelectedTicket(null); updateUrlWithItem('ticket', null); }}
                        className={`flex items-center gap-2 font-semibold transition-colors ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tickets
                      </button>
                    ) : (
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Support Tickets</h3>
                    )}
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {selectedTicket ? '1 selected' : `Showing ${filteredTickets.length} of ${activeTickets.length}`}
                    </span>
                  </div>
                  <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    {filteredTickets.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No tickets match your search</p>
                      </div>
                    ) : (
                      (selectedTicket ? [selectedTicket] : filteredTickets).map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => { setSelectedTicket(ticket); updateUrlWithItem('ticket', ticket.id); }}
                          className={`w-full p-4 text-left transition-all ${
                            selectedTicket?.id === ticket.id
                              ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                              : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.ticketNumber || ticket.id}</span>
                              {ticket.type === 'enhancement' && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  Enhancement
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.subject || ticket.issueType || 'Support Request'}</p>
                          <p className="text-xs text-gray-500 mt-1">{ticket.company || ticket.name} • {formatDate(ticket.createdAt)}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Ticket Detail - Below List */}
                {selectedTicket ? (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.ticketNumber || selectedTicket.id}</h3>
                        {selectedTicket.type === 'enhancement' && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Enhancement
                          </span>
                        )}
                      </div>
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
                          onClick={() => { setSelectedTicket(null); updateUrlWithItem('ticket', null); }}
                          className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 ">
                      {/* Status Update - Moved to Top */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['open', 'in-progress', 'waiting-customer', 'resolved', 'closed', 'archived'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateTicketStatus(selectedTicket.id, status, 'support')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                selectedTicket.status === status
                                  ? status === 'archived' ? 'bg-gray-600 text-white' : 'bg-blue-600 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conversation Area - Moved to Top */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Conversation</h4>

                        {/* Conversation messages */}
                        <div className="space-y-3 mb-4 ">
                          {/* Original ticket description */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 text-sm font-medium flex-shrink-0">
                              {selectedTicket.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-gray-200'}`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description}</p>
                              </div>
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{selectedTicket.name || 'Customer'} • {formatDate(selectedTicket.createdAt)}</p>
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
                                  <p className={`text-sm whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comment.message}</p>
                                </div>
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
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

                      {/* Editable Ticket Name */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Ticket Name</h4>
                          {!editingSubject && (
                            <button
                              onClick={() => {
                                setEditSubjectValue(selectedTicket.subject || '');
                                setEditingSubject(true);
                              }}
                              className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'text-cyan-400 hover:bg-white/10' : 'text-cyan-600 hover:bg-gray-100'}`}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        {editingSubject ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editSubjectValue}
                              onChange={(e) => setEditSubjectValue(e.target.value)}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                              placeholder="Enter ticket name"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSubject(selectedTicket.id)}
                              disabled={savingSubject}
                              className="px-3 py-2 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                            >
                              {savingSubject ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingSubject(false)}
                              className={`px-3 py-2 text-sm rounded-lg ${theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTicket.subject || 'No name set'}
                          </p>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Customer Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Name</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Email</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Phone</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{(selectedTicket as any).phone || (selectedTicket as any).contactPhone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Company</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.company || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Website</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedTicket.website || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Customer Type</p>
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
                          <div className="col-span-2">
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Associated Project</p>
                            {user?.role === 'admin' ? (
                              <select
                                value={selectedTicket.relatedProjectId || ''}
                                onChange={(e) => handleUpdateProjectAssociation(selectedTicket.id, e.target.value || null)}
                                disabled={updatingProjectAssociation}
                                className={`w-full px-3 py-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} ${updatingProjectAssociation ? 'opacity-50' : ''}`}
                              >
                                <option value="">-- No Project Association --</option>
                                {tickets.filter(t => t.status !== 'archived').map((project) => (
                                  <option key={project.id} value={project.id}>
                                    {project.ticketNumber} - {project.company || project.name || 'Unnamed Project'}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                {selectedTicket.relatedProjectId ? (
                                  (() => {
                                    const project = tickets.find(t => t.id === selectedTicket.relatedProjectId);
                                    return project ? (
                                      <span className="text-cyan-500">{project.ticketNumber} - {project.company || project.name}</span>
                                    ) : selectedTicket.relatedProjectId;
                                  })()
                                ) : 'None'}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Created</p>
                            <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatDate(selectedTicket.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Issue Details */}
                      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Issue Details</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Issue Type</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.issueType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Affected Area</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).affectedArea || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Priority/Severity</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).priority || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Browser</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).browser || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Error Message</p>
                          {(selectedTicket as any).errorMessage ? (
                            <p className={`text-sm mt-1 font-mono p-2 rounded ${theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50'}`}>{(selectedTicket as any).errorMessage}</p>
                          ) : (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>N/A</p>
                          )}
                        </div>
                        <div className="mb-3">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Steps to Reproduce</p>
                          <p className={`text-sm mt-1 whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.description || (selectedTicket as any).stepsToReproduce || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Expected Behavior</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).expectedBehavior || 'N/A'}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Actual Behavior</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).actualBehavior || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Screenshot/Video URL</p>
                          {(selectedTicket as any).screenshot ? (
                            <a href={(selectedTicket as any).screenshot} target="_blank" rel="noopener noreferrer" className={`text-sm hover:underline break-all ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{(selectedTicket as any).screenshot}</a>
                          ) : (
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>N/A</p>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Additional Information</p>
                          <p className={`text-sm mt-1 whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{(selectedTicket as any).additionalInfo || 'N/A'}</p>
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

      case 'archived':
        const archivedTickets = supportTickets.filter(t => t.status === 'archived');
        const archivedProjects = tickets.filter(t => t.status === 'archived');
        const totalArchived = archivedTickets.length + archivedProjects.length;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Archived Items</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{totalArchived} archived items</span>
              </div>
            </div>

            {totalArchived === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No archived items</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Archived tickets and projects will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Archived Project Requests */}
                {archivedProjects.length > 0 && (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Archived Project Requests ({archivedProjects.length})</h3>
                    </div>
                    <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {archivedProjects.map((project) => (
                        <div
                          key={project.id}
                          className={`p-4 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{project.ticketNumber || project.id}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Project
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400`}>
                                archived
                              </span>
                              <button
                                onClick={() => updateTicketStatus(project.id, 'open', 'project')}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.serviceCategory || 'Project Request'}</p>
                          <p className="text-xs text-gray-500 mt-1">{project.company || project.name} • {formatDate(project.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Archived Support Tickets */}
                {archivedTickets.length > 0 && (
                  <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Archived Support Tickets ({archivedTickets.length})</h3>
                    </div>
                    <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                      {archivedTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-4 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{ticket.ticketNumber || ticket.id}</span>
                              {ticket.type === 'enhancement' && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  Enhancement
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400`}>
                                archived
                              </span>
                              <button
                                onClick={() => updateTicketStatus(ticket.id, 'open', 'support')}
                                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                  theme === 'dark' ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                                }`}
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ticket.subject || ticket.issueType || 'Support Request'}</p>
                          <p className="text-xs text-gray-500 mt-1">{ticket.company || ticket.name} • {formatDate(ticket.createdAt)}</p>
                        </div>
                      ))}
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
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New User
                </button>
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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
        fixed md:relative z-50 h-full flex flex-col transition-all duration-300
        ${theme === 'dark' ? 'bg-gray-900 border-r border-white/10' : 'bg-white border-r border-gray-200'}
      `}>
        {/* Logo + Toggle */}
        <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
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
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            // Get count for each nav item
            const getNavCount = () => {
              if (user?.role === 'admin') {
                switch (item.id) {
                  case 'all-requests': return tickets.filter(t => t.status !== 'archived').length;
                  case 'all-support': return supportTickets.filter(t => t.status !== 'archived').length;
                  case 'users': return registeredUsers.length;
                  default: return null;
                }
              } else {
                switch (item.id) {
                  case 'projects': return tickets.filter(t => t.status !== 'archived').length;
                  case 'support': return supportTickets.filter(t => t.status !== 'archived').length;
                  default: return null;
                }
              }
            };
            const count = getNavCount();

            return (
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
                {sidebarOpen && (
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                )}
                {sidebarOpen && count !== null && count > 0 && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center ${
                    activeSection === item.id
                      ? 'bg-white/20 text-white'
                      : theme === 'dark'
                        ? 'bg-white/10 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Small icons at bottom - Archived & Settings (Admin only) */}
          {user?.role === 'admin' && (
            <div className={`mt-4 pt-4 border-t flex ${sidebarOpen ? 'gap-2' : 'flex-col gap-2'} ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveSection('archived' as NavSection)}
                title="Archived"
                className={`${sidebarOpen ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${
                  activeSection === 'archived'
                    ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'
                    : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setActiveSection('settings' as NavSection)}
                title="Settings"
                className={`${sidebarOpen ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${
                  activeSection === 'settings'
                    ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'
                    : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* User Menu */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-900'}`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                </div>
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
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Expand sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Log Out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className={`sticky top-0 z-10 backdrop-blur-sm px-4 md:px-8 py-4 ${
          theme === 'dark' ? 'bg-gray-950/95 border-b border-white/10' : 'bg-white/95 border-b border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`md:hidden p-2 rounded-lg transition-all ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {navItems.find(i => i.id === activeSection)?.label}
                  </h1>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, {user?.name}</p>
              </div>
            </div>
            {user?.role !== 'admin' && (
              <div className="flex items-center gap-4">
                <Link
                  href="/#submit-ticket"
                  className={`px-3 py-2 text-sm md:px-4 md:text-base font-medium rounded-lg hover:shadow-lg transition-all ${
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
        <div className="p-4 md:p-8">
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

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-white/10' : 'bg-white shadow-xl'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New User</h3>
              <button onClick={() => setShowNewUserModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Name *</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Password *</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Company</label>
                  <input
                    type="text"
                    value={newUserForm.company}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => setShowNewUserModal(false)}
                className={`px-4 py-3 font-semibold rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-white/10' : 'bg-white shadow-xl'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Ticket</h3>
              <button onClick={() => setShowNewTicketModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Assign to User</label>
                <select
                  value={newTicketForm.userId}
                  onChange={(e) => handleUserSelectChange(e.target.value, 'ticket')}
                  className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">-- Select a user (optional) --</option>
                  {apiUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ticket Name *</label>
                <input
                  type="text"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief title for the ticket"
                  className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Request Type</label>
                  <select
                    value={newTicketForm.requestType}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, requestType: e.target.value as 'new_project' | 'technical_issue' | 'enhancement' }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="technical_issue">Technical Issue</option>
                    <option value="enhancement">Enhancement</option>
                    <option value="new_project">New Project</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Contact Name</label>
                  <input
                    type="text"
                    value={newTicketForm.contactName}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Contact name"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Contact Email</label>
                  <input
                    type="email"
                    value={newTicketForm.contactEmail}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description *</label>
                <textarea
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue or request..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg resize-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTicket}
                disabled={creatingTicket}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {creatingTicket ? 'Creating...' : 'Create Ticket'}
              </button>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className={`px-4 py-3 font-semibold rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 border border-white/10' : 'bg-white shadow-xl'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Project</h3>
              <button onClick={() => setShowNewProjectModal(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {/* Only admins can assign to other users */}
              {user?.role === 'admin' ? (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Assign to User *</label>
                  <select
                    value={newProjectForm.userId}
                    onChange={(e) => handleUserSelectChange(e.target.value, 'project')}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">-- Select a user --</option>
                    {apiUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* For customers, auto-set their user ID */
                <input type="hidden" value={user?.id || ''} />
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project Name *</label>
                <input
                  type="text"
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Project name"
                  className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project Type</label>
                  <select
                    value={newProjectForm.type}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    {PROJECT_TYPES.map(pt => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Timeline</label>
                  <select
                    value={newProjectForm.timeline}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, timeline: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-month">1 Month</option>
                    <option value="1-3-months">1-3 Months</option>
                    <option value="3-6-months">3-6 Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Budget Range</label>
                  <select
                    value={newProjectForm.budgetRange}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">Select budget</option>
                    <option value="under-5k">Under $5,000</option>
                    <option value="5k-15k">$5,000 - $15,000</option>
                    <option value="15k-50k">$15,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="over-100k">Over $100,000</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Website URL</label>
                  <input
                    type="text"
                    value={newProjectForm.website}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 border rounded-lg ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Description *</label>
                <textarea
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project requirements..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg resize-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProject}
                disabled={creatingProject}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className={`px-4 py-3 font-semibold rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
