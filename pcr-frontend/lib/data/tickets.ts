import { ProjectType } from './projects';

// Ticket Categories
export const TICKET_CATEGORIES = [
  { value: 'support', label: 'Technical Support' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'billing', label: 'Billing' },
  { value: 'project', label: 'Project Request' },
  { value: 'general', label: 'General Inquiry' },
] as const;

export const ISSUE_TYPES = [
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
] as const;

export const AFFECTED_AREAS = [
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
] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number]['value'];
export type IssueType = typeof ISSUE_TYPES[number]['value'];
export type AffectedArea = typeof AFFECTED_AREAS[number]['value'];
export type TicketStatus = 'new' | 'open' | 'pending' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'critical';
export type RequestType = 'new_project' | 'technical_issue';

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string | null;
  projectId: string | null;

  // Request info
  requestType: RequestType;
  category: TicketCategory;

  // For technical issues
  issueType?: IssueType;
  affectedArea?: AffectedArea;
  errorMessage?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  screenshot?: string;

  // For project requests
  projectType?: ProjectType;

  // Common fields
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  additionalInfo?: string;
  website?: string;

  // Contact info (for non-authenticated users)
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;

  // Timestamps
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  userId?: string | null;
  projectId?: string | null;
  requestType: RequestType;

  // Technical issue fields
  issueType?: string;
  affectedArea?: string;
  errorMessage?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  screenshot?: string;

  // Project request fields
  projectType?: string;

  // Common
  priority?: TicketPriority;
  description: string;
  additionalInfo?: string;
  website?: string;

  // Contact (for guests)
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
}

const STORAGE_KEY = 'zenweb_tickets';

// Generate ticket number: TKT-YYYYMMDD-XXX
function generateTicketNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${dateStr}-${random}`;
}

// Generate unique ID
function generateId(): string {
  return 'tkt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Determine category from request type
function getCategory(input: CreateTicketInput): TicketCategory {
  if (input.requestType === 'new_project') return 'project';
  if (input.issueType === 'bug') return 'bug';
  if (input.issueType === 'feature') return 'feature';
  return 'support';
}

// Determine priority from severity/issue type
function determinePriority(input: CreateTicketInput): TicketPriority {
  if (input.priority) return input.priority;
  if (input.issueType === 'security' || input.issueType === 'downtime') return 'critical';
  if (input.issueType === 'payment' || input.issueType === 'bug') return 'high';
  return 'normal';
}

// Generate subject from input
function generateSubject(input: CreateTicketInput): string {
  if (input.requestType === 'new_project') {
    const typeLabel = input.projectType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'New Project';
    return `New Project Request: ${typeLabel}`;
  }
  const issueLabel = ISSUE_TYPES.find(t => t.value === input.issueType)?.label || 'Support Request';
  return issueLabel;
}

// Get all tickets
export function getAllTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get tickets by user ID
export function getTicketsByUserId(userId: string): Ticket[] {
  return getAllTickets().filter(t => t.userId === userId);
}

// Get tickets by project ID
export function getTicketsByProjectId(projectId: string): Ticket[] {
  return getAllTickets().filter(t => t.projectId === projectId);
}

// Get ticket by ID
export function getTicketById(id: string): Ticket | null {
  return getAllTickets().find(t => t.id === id) || null;
}

// Get ticket by ticket number
export function getTicketByNumber(ticketNumber: string): Ticket | null {
  return getAllTickets().find(t => t.ticketNumber === ticketNumber) || null;
}

// Create a new ticket
export function createTicket(input: CreateTicketInput): { success: boolean; ticket?: Ticket; message: string } {
  console.log('=== CREATE TICKET DEBUG ===');
  console.log('Input received:', input);

  try {
    const tickets = getAllTickets();
    console.log('Existing tickets count:', tickets.length);

    const newTicket: Ticket = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      userId: input.userId || null,
      projectId: input.projectId || null,

      requestType: input.requestType,
      category: getCategory(input),

      // Technical issue fields
      issueType: input.issueType as IssueType,
      affectedArea: input.affectedArea as AffectedArea,
      errorMessage: input.errorMessage,
      stepsToReproduce: input.stepsToReproduce,
      expectedBehavior: input.expectedBehavior,
      actualBehavior: input.actualBehavior,
      browser: input.browser,
      screenshot: input.screenshot,

      // Project fields
      projectType: input.projectType as ProjectType,

      // Common
      priority: determinePriority(input),
      status: 'new',
      subject: generateSubject(input),
      description: input.description || input.stepsToReproduce || '',
      additionalInfo: input.additionalInfo,
      website: input.website,

      // Contact
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      contactCompany: input.contactCompany,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tickets.push(newTicket);
    console.log('New ticket created:', newTicket);
    console.log('Total tickets after push:', tickets.length);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));

    // Verify storage
    const verifyStorage = localStorage.getItem(STORAGE_KEY);
    console.log('Verified storage after save:', verifyStorage ? JSON.parse(verifyStorage).length + ' tickets' : 'EMPTY!');

    return { success: true, ticket: newTicket, message: 'Ticket created successfully' };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, message: 'Failed to create ticket' };
  }
}

// Update ticket
export function updateTicket(id: string, updates: Partial<Ticket>): { success: boolean; ticket?: Ticket; message: string } {
  try {
    const tickets = getAllTickets();
    const index = tickets.findIndex(t => t.id === id);

    if (index === -1) {
      return { success: false, message: 'Ticket not found' };
    }

    tickets[index] = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return { success: true, ticket: tickets[index], message: 'Ticket updated successfully' };
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, message: 'Failed to update ticket' };
  }
}

// Update ticket status
export function updateTicketStatus(id: string, status: TicketStatus): { success: boolean; message: string } {
  const updates: Partial<Ticket> = { status };

  if (status === 'resolved') {
    updates.resolvedAt = new Date().toISOString();
  } else if (status === 'closed') {
    updates.closedAt = new Date().toISOString();
  }

  return updateTicket(id, updates);
}

// Link ticket to project
export function linkTicketToProject(ticketId: string, projectId: string): { success: boolean; message: string } {
  return updateTicket(ticketId, { projectId });
}

// Get status color for UI
export function getTicketStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    new: 'blue',
    open: 'cyan',
    pending: 'yellow',
    in_progress: 'purple',
    waiting_customer: 'orange',
    resolved: 'green',
    closed: 'gray',
  };
  return colors[status] || 'gray';
}

// Get priority color for UI
export function getTicketPriorityColor(priority: TicketPriority): string {
  const colors: Record<TicketPriority, string> = {
    low: 'gray',
    normal: 'blue',
    high: 'orange',
    critical: 'red',
  };
  return colors[priority] || 'gray';
}
