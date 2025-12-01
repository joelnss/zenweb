'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/data/users';
import { useTheme } from '@/lib/theme/theme-context';
import { createTicket } from '@/lib/data/tickets';

const webPlatforms = [
  'WordPress',
  'Shopify',
  'Magento',
  'Shopware',
  'WooCommerce',
  'BigCommerce',
  'Drupal',
  'Joomla',
  'Webflow',
  'Squarespace',
  'Wix',
  'Custom CMS',
  'Headless CMS (Contentful, Sanity, Strapi)',
  'Next.js / React',
  'Static Site (HTML/CSS/JS)',
  'Other / Not Sure',
];

const serviceCategories = [
  { value: 'new-project', label: 'New Project / Website Build' },
  { value: 'ecommerce', label: 'eCommerce Platform Development' },
  { value: 'mobile-first', label: 'Mobile-First Web Design' },
  { value: 'pwa', label: 'Progressive Web App (PWA) Development' },
  { value: 'api', label: 'API Development & Integration' },
  { value: 'backend', label: 'Backend Infrastructure Optimization' },
  { value: 'frontend', label: 'Frontend Development & UI Integration' },
  { value: 'payment', label: 'Secure Payment Gateway Integration' },
  { value: 'database', label: 'Database Architecture & Design' },
  { value: 'hosting', label: 'Cloud Hosting & Scalability' },
  { value: 'cross-platform', label: 'Cross-platform App Development' },
  { value: 'performance', label: 'Performance Optimization' },
  { value: 'security', label: 'Security & Compliance Implementation' },
  { value: 'plugin', label: 'Plugin & Extension Development' },
  { value: 'cms', label: 'CMS Customization' },
  { value: 'multilang', label: 'Multi-language & Multi-currency Support' },
  { value: 'search', label: 'Advanced Search Functionality' },
  { value: 'inventory', label: 'Inventory Management Integration' },
  { value: 'backup', label: 'Automated Backup Solutions' },
  { value: 'analytics', label: 'Real-time Analytics Integration' },
  { value: 'third-party', label: 'Third-party Software Integration' },
  { value: 'other', label: 'Other / General Inquiry' },
];

const hostingNeeds = [
  { value: 'none', label: 'No hosting needed - I have my own' },
  { value: 'migration', label: 'Migrate existing site to new hosting' },
  { value: 'shared', label: 'Shared hosting (small sites, blogs)' },
  { value: 'vps', label: 'VPS hosting (medium traffic, more control)' },
  { value: 'dedicated', label: 'Dedicated server (high traffic, enterprise)' },
  { value: 'cloud', label: 'Cloud hosting (AWS, Vercel, Railway)' },
  { value: 'managed', label: 'Managed WordPress hosting' },
  { value: 'ecommerce-hosting', label: 'eCommerce-optimized hosting' },
  { value: 'unsure', label: 'Not sure - need consultation' },
];

const budgetRanges = [
  { value: 'under-5k', label: 'Under $5,000' },
  { value: '5k-15k', label: '$5,000 - $15,000' },
  { value: '15k-50k', label: '$15,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: 'over-100k', label: '$100,000+' },
  { value: 'discuss', label: 'Prefer to discuss' },
];

const projectTimelines = [
  { value: 'asap', label: 'ASAP - Urgent' },
  { value: '1-month', label: 'Within 1 month' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: 'flexible', label: 'Flexible / No rush' },
];

interface TicketFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  platform: string;
  serviceCategory: string;
  hostingNeeds: string;
  budget: string;
  timeline: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TicketFormProps {
  preSelectedService?: string | null;
}

export default function TicketForm({ preSelectedService }: TicketFormProps = {}) {
  const { theme } = useTheme();
  const { user, isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [createAccount, setCreateAccount] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');

  const [formData, setFormData] = useState<TicketFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    website: '',
    platform: '',
    serviceCategory: preSelectedService || '',
    hostingNeeds: '',
    budget: '',
    timeline: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WEB-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAccountError('');

    // If creating account, validate passwords
    if (!isAuthenticated && createAccount) {
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
        password,
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
      const loginSuccess = await login(formData.email, password);
      if (!loginSuccess) {
        setAccountError('Account created but login failed. Please log in manually.');
      }
    }

    try {
      // Use unified ticket system
      const result = createTicket({
        userId: user?.id || null,
        requestType: 'new_project',
        projectType: formData.serviceCategory as string,
        description: formData.description,
        website: formData.website,
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        contactCompany: formData.company,
        additionalInfo: `Platform: ${formData.platform}\nHosting: ${formData.hostingNeeds}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}`,
        priority: formData.priority === 'urgent' ? 'critical' : formData.priority === 'high' ? 'high' : formData.priority === 'low' ? 'low' : 'normal',
      });

      if (!result.success || !result.ticket) {
        throw new Error(result.message);
      }

      setTicketNumber(result.ticket.ticketNumber);
      setSuccess(true);

      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        company: '',
        website: '',
        platform: '',
        serviceCategory: '',
        hostingNeeds: '',
        budget: '',
        timeline: '',
        description: '',
        priority: 'medium',
      });

      setPassword('');
      setConfirmPassword('');

      // Always redirect to dashboard after successful submission with account
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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

  if (success) {
    return (
      <div className={`py-20 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className={`max-w-2xl mx-auto backdrop-blur-sm rounded-2xl p-8 border ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Request Submitted!</h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Your reference number is:</p>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">{ticketNumber}</div>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                We'll review your requirements and get back to you within 24-48 hours with a detailed proposal.
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-20 relative overflow-hidden ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`} id="submit-ticket">
      {/* Animated background orbs - Dark mode only */}
      {theme === 'dark' && (
        <>
          <motion.div
            className="absolute top-1/4 -left-20 w-80 h-80 bg-gray-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 70, 0],
              y: [0, 60, 0],
              scale: [1, 1.25, 1],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -60, 0],
              y: [0, -70, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gray-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Start Your Project</h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tell us about your web development needs and we'll craft a solution
            </p>
            {!isAuthenticated && (
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Create an account when you submit to track your project • Already have an account? <a href="/login" className="text-blue-400 font-semibold hover:underline">Log in</a>
              </p>
            )}
          </div>

          {/* Form */}
          <div className={`backdrop-blur-sm rounded-2xl p-8 border ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 disabled:bg-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border border-gray-300 disabled:bg-gray-100 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 disabled:bg-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border border-gray-300 disabled:bg-gray-100 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company / Organization
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                {/* Account Creation Section */}
                {!isAuthenticated && (
                  <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create an Account</h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Track your project and access your dashboard</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreateAccount(!createAccount)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          createAccount ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            createAccount ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {createAccount && (
                      <>
                        {accountError && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
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
                              className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
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
                              className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                                  : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                              }`}
                              placeholder="Confirm your password"
                            />
                          </div>
                        </div>
                        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Your account gives you access to project tracking, support tickets, and invoicing.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="website" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Website URL (if applicable)
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={formData.website}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                          : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="platform" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current/Preferred Platform *
                    </label>
                    <select
                      id="platform"
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select a platform...</option>
                      {webPlatforms.map((platform) => (
                        <option key={platform} value={platform} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="serviceCategory" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Service Category *
                    </label>
                    <select
                      id="serviceCategory"
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select a service...</option>
                      {serviceCategories.map((service) => (
                        <option key={service.value} value={service.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Hosting & Infrastructure */}
              <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Hosting & Infrastructure</h3>
                <div>
                  <label htmlFor="hostingNeeds" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Hosting Requirements *
                  </label>
                  <select
                    id="hostingNeeds"
                    name="hostingNeeds"
                    value={formData.hostingNeeds}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select hosting needs...</option>
                    {hostingNeeds.map((option) => (
                      <option key={option.value} value={option.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    We offer managed hosting as an add-on service with 99.9% uptime guarantee
                  </p>
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className={`border-b pb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Budget & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budget" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estimated Budget *
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select budget range...</option>
                      {budgetRanges.map((range) => (
                        <option key={range.value} value={range.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeline" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Project Timeline *
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Select timeline...</option>
                      {projectTimelines.map((timeline) => (
                        <option key={timeline.value} value={timeline.value} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
                          {timeline.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority Level *
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="low" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Low - Exploratory / Planning phase</option>
                      <option value="medium" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Medium - Active project, flexible timing</option>
                      <option value="high" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>High - Time-sensitive launch</option>
                      <option value="urgent" className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>Urgent - Critical fix or deadline</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Describe your project goals, features needed, integrations required, or any challenges you're facing..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-4 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project Request'}
              </button>

              <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                We'll respond within 24-48 hours with a detailed proposal and next steps.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
