// API service for tickets - connects to backend instead of localStorage

// In production, use relative URL (nginx proxies /api to backend)
// In development, use localhost:3001
const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3001/api');

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string | null;
  projectId: string | null;
  requestType: 'new_project' | 'technical_issue' | 'enhancement';
  category: string;
  relatedProjectId?: string | null;
  issueType?: string;
  affectedArea?: string;
  errorMessage?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  screenshot?: string;
  projectType?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: string;
  subject: string;
  description: string;
  additionalInfo?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  proposalAmount?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  paymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  userId?: string | null;
  projectId?: string | null;
  requestType: 'new_project' | 'technical_issue' | 'enhancement';
  issueType?: string;
  relatedProjectId?: string | null;
  affectedArea?: string;
  errorMessage?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  screenshot?: string;
  projectType?: string;
  priority?: string;
  description: string;
  additionalInfo?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
}

// Get all tickets
export async function getAllTickets(): Promise<Ticket[]> {
  try {
    const response = await fetch(`${API_BASE}/tickets`);
    const data = await response.json();
    return data.success ? data.tickets : [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

// Get tickets by user ID
export async function getTicketsByUserId(userId: string): Promise<Ticket[]> {
  try {
    const response = await fetch(`${API_BASE}/tickets/user/${userId}`);
    const data = await response.json();
    return data.success ? data.tickets : [];
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }
}

// Get ticket by ID
export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const response = await fetch(`${API_BASE}/tickets/${id}`);
    const data = await response.json();
    return data.success ? data.ticket : null;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

// Create a new ticket
export async function createTicket(input: CreateTicketInput): Promise<{ success: boolean; ticket?: Ticket; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, message: 'Failed to create ticket - server may be offline' };
  }
}

// Update ticket
export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<{ success: boolean; ticket?: Ticket; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, message: 'Failed to update ticket' };
  }
}

// Update ticket status
export async function updateTicketStatus(id: string, status: string): Promise<{ success: boolean; message: string }> {
  const updates: Partial<Ticket> = { status };

  if (status === 'resolved') {
    updates.resolvedAt = new Date().toISOString();
  } else if (status === 'closed') {
    updates.closedAt = new Date().toISOString();
  }

  return updateTicket(id, updates);
}

// Delete ticket
export async function deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, message: 'Failed to delete ticket' };
  }
}

// Get status color for UI
export function getTicketStatusColor(status: string): string {
  const colors: Record<string, string> = {
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
export function getTicketPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'gray',
    normal: 'blue',
    high: 'orange',
    critical: 'red',
  };
  return colors[priority] || 'gray';
}

// ==================== TICKET COMMENTS ====================

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string | null;
  userName: string;
  userRole: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface CreateCommentInput {
  userId?: string | null;
  userName: string;
  userRole: 'user' | 'admin';
  message: string;
}

// Get comments for a ticket
export async function getTicketComments(ticketId: string): Promise<TicketComment[]> {
  try {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/comments`);
    const data = await response.json();
    return data.success ? data.comments : [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Add a comment to a ticket
export async function addTicketComment(ticketId: string, input: CreateCommentInput): Promise<{ success: boolean; comment?: TicketComment; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, message: 'Failed to add comment' };
  }
}

// ==================== PAYMENT FUNCTIONS ====================

// Create Stripe checkout session for ticket payment
export async function createPaymentCheckout(ticketId: string): Promise<{ success: boolean; sessionId?: string; url?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/payments/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout:', error);
    return { success: false, message: 'Failed to create payment checkout' };
  }
}

// Verify payment after redirect from Stripe
export async function verifyPayment(ticketId: string, sessionId?: string): Promise<{ success: boolean; paymentStatus?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketId, sessionId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, message: 'Failed to verify payment' };
  }
}
