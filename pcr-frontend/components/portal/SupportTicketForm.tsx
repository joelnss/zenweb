'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { motion } from 'framer-motion';
import { registerUser } from '@/lib/data/users';
import { createProject, PROJECT_TYPES, ProjectType } from '@/lib/data/projects';
import { createTicket, getAllTickets } from '@/lib/api/tickets';

const issueTypes = [
  { value: 'bug', label: 'Bug / Error' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'security', label: 'Security Concern' },
  { value: 'downtime', label: 'Site Down / Unreachable' },
  { value: 'content', label: 'Content Update Request' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'integration', label: 'Integration Issue' },
  { value: 'payment', label: 'Payment / Checkout Issue' },
  { value: 'email', label: 'Email / Forms Not Working' },
  { value: 'ssl', label: 'SSL / Certificate Issue' },
  { value: 'domain', label: 'Domain / DNS Issue' },
  { value: 'backup', label: 'Backup / Restore Request' },
  { value: 'other', label: 'Other Technical Issue' },
];

const projectTypes = PROJECT_TYPES;

const affectedAreas = [
  { value: 'frontend', label: 'Frontend / UI' },
  { value: 'backend', label: 'Backend / Server' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API / Integrations' },
  { value: 'hosting', label: 'Hosting / Infrastructure' },
  { value: 'cdn', label: 'CDN / Caching' },
  { value: 'cms', label: 'CMS / Admin Panel' },
  { value: 'checkout', label: 'Checkout / Cart' },
  { value: 'analytics', label: 'Analytics / Tracking' },
  { value: 'seo', label: 'SEO / Search' },
  { value: 'mobile', label: 'Mobile / Responsive' },
  { value: 'unknown', label: 'Not Sure' },
];

const browsers = [
  'Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Mobile Safari', 'Chrome Mobile', 'Other'
];


interface SupportTicketFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  requestType: 'new_project' | 'technical_issue' | 'enhancement' | '';
  projectType: string;
  issueType: string;
  affectedArea: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  browser: string;
  errorMessage: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  screenshot: string;
  additionalInfo: string;
  relatedProjectId: string;
}

interface UserProject {
  id: string;
  ticketNumber: string;
  contactCompany?: string;
  contactName?: string;
  projectType?: string;
  status: string;
  createdAt: string;
}

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

export default function SupportTicketForm({ onSuccess }: SupportTicketFormProps = {}) {
  const { theme } = useTheme();
  const { user, isAuthenticated, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [submittedRequestType, setSubmittedRequestType] = useState<'new_project' | 'technical_issue' | 'enhancement' | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createAccount, setCreateAccount] = useState(true);
  const [accountError, setAccountError] = useState('');

  // New state for customer type selection
  const [customerType, setCustomerType] = useState<'new' | 'returning' | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // State for user's existing projects
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);

  const [formData, setFormData] = useState<SupportTicketFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    website: '',
    requestType: '',
    projectType: '',
    issueType: '',
    affectedArea: '',
    severity: 'medium',
    browser: '',
    errorMessage: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    screenshot: '',
    additionalInfo: '',
    relatedProjectId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
      }));
      // If user is already authenticated, skip the customer type selection
      setCustomerType('returning');
    }
  }, [user]);

  // Fetch user's projects when authenticated
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const tickets = await getAllTickets();
          console.log('Fetched tickets for project dropdown:', tickets);
          console.log('User ID:', user.id);
          if (Array.isArray(tickets)) {
            // Filter to only show this user's projects (new_project type tickets)
            const projects = tickets.filter(
              (ticket: UserProject & { userId?: string; requestType?: string }) =>
                ticket.userId === user.id && ticket.requestType === 'new_project'
            );
            console.log('Filtered user projects:', projects);
            setUserProjects(projects);
          }
        } catch (error) {
          console.error('Error fetching user projects:', error);
        }
      }
    };

    fetchUserProjects();
  }, [isAuthenticated, user?.id]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const success = await login(loginEmail, loginPassword);
      if (!success) {
        setLoginError('Invalid email or password. Please try again.');
      }
    } catch {
      setLoginError('An error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Random test data generator
  const fillRandomTestData = () => {
    const randomNames = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Chris Brown', 'Emily Davis'];
    const randomCompanies = ['Acme Corp', 'Tech Solutions', 'Digital Agency', 'Web Pros', 'Cloud Nine', 'StartupXYZ'];
    const randomWebsites = ['example.com', 'mysite.io', 'testshop.com', 'demo-store.net', 'client-site.org'];
    const randomErrors = ['404 Not Found', 'Internal Server Error', 'Page timeout', 'Form not submitting', 'Payment failed'];
    const randomSteps = [
      '1. Go to homepage\n2. Click on Products\n3. Add item to cart\n4. Checkout fails',
      '1. Login to account\n2. Navigate to settings\n3. Click save\n4. Error appears',
      '1. Visit the page\n2. Fill out form\n3. Submit\n4. Nothing happens'
    ];

    const randomId = Math.floor(Math.random() * 1000);
    const requestTypes: ('new_project' | 'technical_issue')[] = ['new_project', 'technical_issue'];
    const selectedRequestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];

    setFormData({
      name: randomNames[Math.floor(Math.random() * randomNames.length)],
      email: `test${randomId}@example.com`,
      phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: randomCompanies[Math.floor(Math.random() * randomCompanies.length)],
      website: randomWebsites[Math.floor(Math.random() * randomWebsites.length)],
      requestType: selectedRequestType,
      projectType: selectedRequestType === 'new_project' ? projectTypes[Math.floor(Math.random() * projectTypes.length)].value : '',
      issueType: selectedRequestType === 'technical_issue' ? issueTypes[Math.floor(Math.random() * issueTypes.length)].value : '',
      affectedArea: selectedRequestType === 'technical_issue' ? affectedAreas[Math.floor(Math.random() * affectedAreas.length)].value : '',
      severity: (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 4)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      errorMessage: randomErrors[Math.floor(Math.random() * randomErrors.length)],
      stepsToReproduce: randomSteps[Math.floor(Math.random() * randomSteps.length)],
      expectedBehavior: 'It should work correctly without errors',
      actualBehavior: 'The page shows an error or does not respond',
      screenshot: '',
      additionalInfo: `Test ticket #${randomId} - Random test data for QA purposes`,
      relatedProjectId: '',
    });

    // Set customer type to new if not authenticated
    if (!isAuthenticated) {
      setCustomerType('new');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAccountError('');

    // If creating account and not already authenticated
    if (!isAuthenticated && customerType === 'new' && createAccount) {
      // Validate password
      if (password.length < 6) {
        setAccountError('Password must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setAccountError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      // Register the user
      const result = registerUser({
        email: formData.email,
        password: password,
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
        },
      });

      if (!result.success) {
        setAccountError(result.message);
        setIsSubmitting(false);
        return;
      }

      // Auto-login after registration
      await login(formData.email, password);
    }

    try {
      let projectId: string | null = null;

      // If new project request, create the project first
      if (formData.requestType === 'new_project' && user?.id) {
        const projectResult = createProject({
          userId: user.id,
          name: `${projectTypes.find(t => t.value === formData.projectType)?.label || 'New Project'} - ${formData.company || formData.name || 'Client'}`,
          type: formData.projectType as ProjectType,
          description: formData.stepsToReproduce || formData.additionalInfo || '',
          timeline: formData.expectedBehavior,
          budgetRange: formData.actualBehavior,
          website: formData.website,
        });

        if (projectResult.success && projectResult.project) {
          projectId = projectResult.project.id;
        }
      }

      // Create the ticket
      const ticketData = {
        userId: user?.id || null,
        projectId,
        requestType: formData.requestType as 'new_project' | 'technical_issue' | 'enhancement',

        // Technical issue fields
        issueType: formData.issueType,
        affectedArea: formData.affectedArea,
        errorMessage: formData.errorMessage,
        stepsToReproduce: formData.stepsToReproduce,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        browser: formData.browser,
        screenshot: formData.screenshot,

        // Related project for technical issues
        relatedProjectId: formData.relatedProjectId || null,

        // Project request fields
        projectType: formData.projectType,

        // Common
        priority: formData.severity === 'critical' ? 'critical' : formData.severity === 'high' ? 'high' : 'normal',
        description: formData.stepsToReproduce || formData.additionalInfo || '',
        additionalInfo: formData.additionalInfo,
        website: formData.website,

        // Contact info - always save regardless of auth status
        contactName: formData.name || user?.name,
        contactEmail: formData.email || user?.email,
        contactPhone: formData.phone || user?.phone,
        contactCompany: formData.company || user?.company,
      };

      console.log('=== SUPPORT TICKET FORM DEBUG ===');
      console.log('Creating ticket with data:', ticketData);
      console.log('User authenticated:', isAuthenticated);
      console.log('User object:', user);

      const ticketResult = await createTicket(ticketData);

      console.log('Ticket creation result:', ticketResult);

      if (!ticketResult.success) {
        setAccountError(ticketResult.message);
        setIsSubmitting(false);
        return;
      }

      setTicketNumber(ticketResult.ticket?.ticketNumber || '');
      setSubmittedRequestType(formData.requestType as 'new_project' | 'technical_issue' | 'enhancement');
      setSuccess(true);

      console.log('Ticket created successfully:', ticketResult.ticket?.ticketNumber);

      // Call onSuccess callback if provided (e.g., to refresh dashboard)
      if (onSuccess) {
        onSuccess();
      }

      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        company: '',
        website: '',
        requestType: '',
        projectType: '',
        issueType: '',
        affectedArea: '',
        severity: 'medium',
        browser: '',
        errorMessage: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        screenshot: '',
        additionalInfo: '',
        relatedProjectId: '',
      });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error saving ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-sm rounded-2xl p-8 border max-w-md w-full ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {submittedRequestType === 'new_project' ? 'Project Request Submitted!' :
               submittedRequestType === 'enhancement' ? 'Enhancement Request Submitted!' :
               'Support Ticket Created!'}
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {submittedRequestType === 'new_project' ? 'Your project reference number is:' :
               submittedRequestType === 'enhancement' ? 'Your enhancement request number is:' :
               'Your ticket number is:'}
            </p>
            <div className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {ticketNumber}
            </div>
            <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {submittedRequestType === 'new_project'
                ? 'Our team will review your project request and get back to you within 24-48 hours with next steps.'
                : submittedRequestType === 'enhancement'
                ? 'Our team will review your enhancement request and provide a quote within 24-48 hours.'
                : 'Our team will review your issue and respond within 4-24 hours depending on severity.'}
            </p>

            <button
              onClick={() => {
                setSuccess(false);
                setSubmittedRequestType('');
                setCustomerType(null);
              }}
              className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {submittedRequestType === 'new_project' ? 'Submit Another Request' :
               submittedRequestType === 'enhancement' ? 'Submit Another Enhancement' :
               'Submit Another Ticket'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Customer type selection screen (only show if not authenticated)
  if (!isAuthenticated && customerType === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-sm rounded-2xl p-8 border ${
          theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
        }`}
      >
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Support
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Are you a new or returning customer?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setCustomerType('new')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              theme === 'dark'
                ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              New Customer
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              First time submitting a ticket? Start here.
            </p>
          </button>

          <button
            onClick={() => setCustomerType('returning')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              theme === 'dark'
                ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h4 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Returning Customer
            </h4>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account? Sign in for faster support.
            </p>
          </button>
        </div>
      </motion.div>
    );
  }

  // Login screen for returning customers (not yet authenticated)
  if (!isAuthenticated && customerType === 'returning') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-sm rounded-2xl p-8 border ${
          theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
        }`}
      >
        <button
          onClick={() => setCustomerType(null)}
          className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
          }`}>
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to submit your support ticket
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <div>
            <label htmlFor="loginEmail" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              id="loginEmail"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                  : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="loginPassword" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                  : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-all disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In & Continue'}
          </button>

          <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setCustomerType('new')}
              className={`font-medium ${theme === 'dark' ? 'text-white hover:underline' : 'text-gray-900 hover:underline'}`}
            >
              Create one
            </button>
          </p>
        </form>
      </motion.div>
    );
  }

  // Main form (for new customers or authenticated returning customers)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-sm rounded-2xl p-8 border ${
        theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
      }`}
    >
      {/* Back button for new customers */}
      {!isAuthenticated && customerType === 'new' && (
        <button
          onClick={() => setCustomerType(null)}
          className={`flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'}`}>1</span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="company" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Your company"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="website" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website URL
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>

            {/* Account Creation - Only show for new customers */}
            {customerType === 'new' && (
              <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create an Account</h4>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Track your tickets and get faster support</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                      theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'
                    }`}></div>
                  </label>
                </div>

                {createAccount && (
                  <div className="space-y-4">
                    {accountError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                        {accountError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Password *
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={createAccount}
                          className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                            theme === 'dark'
                              ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                              : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Confirm Password *
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required={createAccount}
                          className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                            theme === 'dark'
                              ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                              : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      By creating an account, you can track ticket status, view history, and receive faster support.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        
        {/* Request Type Selection */}
        <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'}`}>{isAuthenticated ? '1' : '2'}</span>
            Request Type
          </h3>

          {/* Request Type Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Technical Issue - First */}
            <div
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                formData.requestType === 'technical_issue'
                  ? theme === 'dark'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-orange-500 bg-orange-50'
                  : theme === 'dark'
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requestType: 'technical_issue', projectType: '' }))}
                className="w-full text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  formData.requestType === 'technical_issue'
                    ? 'bg-orange-500/20'
                    : theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${formData.requestType === 'technical_issue' ? 'text-orange-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Technical Issue
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Report a bug or request support
                </p>
              </button>

              {/* Related Project Dropdown - Inside Technical Issue box */}
              {formData.requestType === 'technical_issue' && isAuthenticated && userProjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-orange-500/30">
                  <label htmlFor="relatedProjectId" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Related Project (optional)
                  </label>
                  <select
                    id="relatedProjectId"
                    name="relatedProjectId"
                    value={formData.relatedProjectId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      Select a project...
                    </option>
                    {userProjects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                        className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
                      >
                        {project.ticketNumber} - {project.contactCompany || project.contactName || 'Project'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Enhancement Request - Second */}
            <div
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                formData.requestType === 'enhancement'
                  ? theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500 bg-purple-50'
                  : theme === 'dark'
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requestType: 'enhancement', projectType: '', issueType: '', affectedArea: '' }))}
                className="w-full text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  formData.requestType === 'enhancement'
                    ? 'bg-purple-500/20'
                    : theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <svg className={`w-5 h-5 ${formData.requestType === 'enhancement' ? 'text-purple-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Enhancement
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Add features to existing project
                </p>
              </button>

              {/* Related Project Dropdown - Inside Enhancement box (required) */}
              {formData.requestType === 'enhancement' && isAuthenticated && userProjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-500/30">
                  <label htmlFor="relatedProjectId" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Related Project *
                  </label>
                  <select
                    id="relatedProjectId"
                    name="relatedProjectId"
                    value={formData.relatedProjectId}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white border border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      Select a project...
                    </option>
                    {userProjects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                        className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
                      >
                        {project.ticketNumber} - {project.contactCompany || project.contactName || 'Project'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* New Project - Third */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, requestType: 'new_project', issueType: '', affectedArea: '', relatedProjectId: '' }))}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                formData.requestType === 'new_project'
                  ? theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-blue-500 bg-blue-50'
                  : theme === 'dark'
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                formData.requestType === 'new_project'
                  ? 'bg-blue-500/20'
                  : theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${formData.requestType === 'new_project' ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                New Project
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start a new web project or development
              </p>
            </button>
          </div>

          {/* New Feature Checkbox - shown when New Project is selected */}
          {formData.requestType === 'new_project' && (
            <label className={`flex items-center gap-2 mb-6 p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <input
                type="checkbox"
                checked={formData.issueType === 'feature'}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, issueType: e.target.checked ? 'feature' : '' }));
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                This is a new feature request
              </span>
            </label>
          )}

          {/* New Project Options */}
          {formData.requestType === 'new_project' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="website" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website URL
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="yourwebsite.com"
                />
              </div>
              <div>
                <label htmlFor="projectType" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Type *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select project type...</option>
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Technical Issue Options */}
          {formData.requestType === 'technical_issue' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issueType" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Issue Type *
                </label>
                <select
                  id="issueType"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select issue type...</option>
                  {issueTypes.map((type) => (
                    <option key={type.value} value={type.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="affectedArea" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Affected Area *
                </label>
                <select
                  id="affectedArea"
                  name="affectedArea"
                  value={formData.affectedArea}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select affected area...</option>
                  {affectedAreas.map((area) => (
                    <option key={area.value} value={area.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="severity" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Severity *
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="low" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Low - Minor inconvenience</option>
                  <option value="medium" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Medium - Functionality impaired</option>
                  <option value="high" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>High - Major feature broken</option>
                  <option value="critical" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Critical - Site down / Security issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="browser" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Browser (if applicable)
                </label>
                <select
                  id="browser"
                  name="browser"
                  value={formData.browser}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select browser...</option>
                  {browsers.map((browser) => (
                    <option key={browser} value={browser} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                      {browser}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website URL for Technical Issues */}
              <div className="md:col-span-2">
                <label htmlFor="website" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website URL
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="yourwebsite.com"
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  The website where you&apos;re experiencing the issue
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details - Only for Technical Issues */}
        {formData.requestType === 'technical_issue' && (
          <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'}`}>{isAuthenticated ? '2' : '3'}</span>
              Technical Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="errorMessage" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Error Message (if any)
                </label>
                <input
                  id="errorMessage"
                  name="errorMessage"
                  type="text"
                  value={formData.errorMessage}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Copy and paste the exact error message here"
                />
              </div>

              <div>
                <label htmlFor="stepsToReproduce" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Steps to Reproduce *
                </label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  required
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="1. Go to page X&#10;2. Click on button Y&#10;3. See error"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expectedBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected Behavior
                  </label>
                  <textarea
                    id="expectedBehavior"
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="What should have happened?"
                  />
                </div>

                <div>
                  <label htmlFor="actualBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actual Behavior
                  </label>
                  <textarea
                    id="actualBehavior"
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="What actually happened?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="screenshot" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Screenshot URL (optional)
                </label>
                <input
                  id="screenshot"
                  name="screenshot"
                  type="text"
                  value={formData.screenshot}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Link to screenshot or video (Imgur, Loom, etc.)"
                />
              </div>

              <div>
                <label htmlFor="additionalInfo" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Any other relevant details, recent changes, or context..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhancement Details - Only for Enhancement Requests */}
        {formData.requestType === 'enhancement' && (
          <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'}`}>{isAuthenticated ? '2' : '3'}</span>
              Enhancement Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="stepsToReproduce" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enhancement Description *
                </label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Describe the new feature or enhancement you'd like to add to your existing project..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expectedBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected Outcome
                  </label>
                  <textarea
                    id="expectedBehavior"
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="What should this enhancement accomplish?"
                  />
                </div>

                <div>
                  <label htmlFor="actualBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timeline / Priority
                  </label>
                  <textarea
                    id="actualBehavior"
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="When do you need this? How urgent is it?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="additionalInfo" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Any reference examples, mockups, or additional context..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Project Details - Only for New Projects */}
        {formData.requestType === 'new_project' && (
          <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-900 text-white'}`}>{isAuthenticated ? '2' : '3'}</span>
              Project Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="stepsToReproduce" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Description *
                </label>
                <textarea
                  id="stepsToReproduce"
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Describe your project requirements, goals, and any specific features you need..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expectedBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timeline / Deadline
                  </label>
                  <textarea
                    id="expectedBehavior"
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="When do you need this completed?"
                  />
                </div>

                <div>
                  <label htmlFor="actualBehavior" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Budget Range
                  </label>
                  <textarea
                    id="actualBehavior"
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                        : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="What's your budget for this project?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="additionalInfo" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/20 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Any other details, reference sites, or specific requirements..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.requestType ||
            (formData.requestType === 'technical_issue' && (!formData.issueType || !formData.affectedArea || !formData.stepsToReproduce)) ||
            (formData.requestType === 'enhancement' && !formData.stepsToReproduce) ||
            (formData.requestType === 'new_project' && (!formData.projectType || !formData.stepsToReproduce))
          }
          className={`w-full px-6 py-4 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isSubmitting ? 'Submitting...' :
            formData.requestType === 'new_project' ? 'Submit Project Request' :
            formData.requestType === 'enhancement' ? 'Submit Enhancement Request' :
            'Submit Support Ticket'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          {formData.requestType === 'new_project'
            ? 'We\'ll review your project request and get back to you within 24-48 hours.'
            : formData.requestType === 'enhancement'
            ? 'We\'ll review your enhancement request and provide a quote within 24-48 hours.'
            : 'Critical issues are prioritized. Response time: 4-24 hours.'}
        </p>
      </form>

      {/* Floating Test Data Button - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={fillRandomTestData}
          className="fixed bottom-6 left-20 z-50 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Fill with random test data"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
