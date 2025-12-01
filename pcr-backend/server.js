const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Twilio SDK for SMS notifications
let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  console.log('Twilio not installed - SMS notifications disabled');
}

// Stripe SDK for payments
let stripe;
try {
  const Stripe = require('stripe');
  // Get Stripe secret key from environment or settings
  stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
} catch (e) {
  console.log('Stripe not installed - payments disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    ticketNumber TEXT UNIQUE NOT NULL,
    userId TEXT,
    projectId TEXT,
    requestType TEXT NOT NULL,
    category TEXT,
    issueType TEXT,
    affectedArea TEXT,
    errorMessage TEXT,
    stepsToReproduce TEXT,
    expectedBehavior TEXT,
    actualBehavior TEXT,
    browser TEXT,
    screenshot TEXT,
    projectType TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'new',
    subject TEXT,
    description TEXT,
    additionalInfo TEXT,
    website TEXT,
    contactName TEXT,
    contactEmail TEXT,
    contactPhone TEXT,
    contactCompany TEXT,
    firstResponseAt TEXT,
    resolvedAt TEXT,
    closedAt TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    role TEXT DEFAULT 'user',
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    timeline TEXT,
    budgetRange TEXT,
    website TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_comments (
    id TEXT PRIMARY KEY,
    ticketId TEXT NOT NULL,
    userId TEXT,
    userName TEXT NOT NULL,
    userRole TEXT DEFAULT 'user',
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

// Add proposalAmount column to tickets if it doesn't exist
try {
  db.exec(`ALTER TABLE tickets ADD COLUMN proposalAmount REAL`);
  console.log('Added proposalAmount column to tickets table');
} catch (e) {
  // Column already exists, ignore error
}

// Add payment columns to tickets if they don't exist
try {
  db.exec(`ALTER TABLE tickets ADD COLUMN paymentStatus TEXT DEFAULT 'unpaid'`);
  console.log('Added paymentStatus column to tickets table');
} catch (e) {
  // Column already exists, ignore error
}

try {
  db.exec(`ALTER TABLE tickets ADD COLUMN paymentId TEXT`);
  console.log('Added paymentId column to tickets table');
} catch (e) {
  // Column already exists, ignore error
}

try {
  db.exec(`ALTER TABLE tickets ADD COLUMN paidAt TEXT`);
  console.log('Added paidAt column to tickets table');
} catch (e) {
  // Column already exists, ignore error
}

// Add relatedProjectId column for linking enhancements/issues to existing projects
try {
  db.exec(`ALTER TABLE tickets ADD COLUMN relatedProjectId TEXT`);
  console.log('Added relatedProjectId column to tickets table');
} catch (e) {
  // Column already exists, ignore error
}

// Create analytics table for page views
db.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    referrer TEXT,
    userAgent TEXT,
    ip TEXT,
    country TEXT,
    city TEXT,
    sessionId TEXT,
    createdAt TEXT NOT NULL
  )
`);

// Create table for unique visitors (sessions)
db.exec(`
  CREATE TABLE IF NOT EXISTS visitor_sessions (
    id TEXT PRIMARY KEY,
    ip TEXT,
    userAgent TEXT,
    firstVisit TEXT NOT NULL,
    lastVisit TEXT NOT NULL,
    pageViews INTEGER DEFAULT 1
  )
`);

// ==================== SMS HELPER FUNCTION ====================
async function sendSmsNotification(message) {
  try {
    // Get Twilio settings from database
    const accountSid = db.prepare('SELECT value FROM settings WHERE key = ?').get('twilio_account_sid');
    const authToken = db.prepare('SELECT value FROM settings WHERE key = ?').get('twilio_auth_token');
    const fromNumber = db.prepare('SELECT value FROM settings WHERE key = ?').get('twilio_phone_number');
    const adminPhone = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_phone_number');

    if (!accountSid || !authToken || !fromNumber || !adminPhone) {
      console.log('SMS settings not configured - skipping notification');
      return { success: false, reason: 'SMS not configured' };
    }

    if (!twilio) {
      console.log('Twilio not installed - skipping SMS');
      return { success: false, reason: 'Twilio not installed' };
    }

    const client = twilio(accountSid.value, authToken.value);
    const result = await client.messages.create({
      body: message,
      from: fromNumber.value,
      to: adminPhone.value
    });

    console.log(`SMS sent: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
}

// Helper: Generate ticket number
function generateTicketNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${dateStr}-${random}`;
}

// ==================== TICKET ROUTES ====================

// GET all tickets
app.get('/api/tickets', (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all();
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// GET tickets by user ID
app.get('/api/tickets/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = db.prepare('SELECT * FROM tickets WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// GET single ticket by ID
app.get('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
});

// CREATE ticket
app.post('/api/tickets', (req, res) => {
  try {
    const {
      userId, projectId, requestType, category, issueType, affectedArea,
      errorMessage, stepsToReproduce, expectedBehavior, actualBehavior,
      browser, screenshot, projectType, priority, subject, description,
      additionalInfo, website, contactName, contactEmail, contactPhone, contactCompany,
      relatedProjectId
    } = req.body;

    const id = 'tkt_' + uuidv4().replace(/-/g, '').slice(0, 16);
    const ticketNumber = generateTicketNumber();
    const now = new Date().toISOString();

    // Determine category from request type
    let finalCategory = category;
    if (!finalCategory) {
      if (requestType === 'new_project') finalCategory = 'project';
      else if (requestType === 'enhancement') finalCategory = 'enhancement';
      else if (issueType === 'bug') finalCategory = 'bug';
      else if (issueType === 'feature') finalCategory = 'feature';
      else finalCategory = 'support';
    }

    // Generate subject
    let finalSubject = subject;
    if (!finalSubject) {
      if (requestType === 'new_project') {
        const typeLabel = projectType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'New Project';
        finalSubject = `New Project Request: ${typeLabel}`;
      } else if (requestType === 'enhancement') {
        finalSubject = `Enhancement Request: ${issueType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Feature Enhancement'}`;
      } else {
        finalSubject = issueType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Support Request';
      }
    }

    const stmt = db.prepare(`
      INSERT INTO tickets (
        id, ticketNumber, userId, projectId, requestType, category, issueType,
        affectedArea, errorMessage, stepsToReproduce, expectedBehavior, actualBehavior,
        browser, screenshot, projectType, priority, status, subject, description,
        additionalInfo, website, contactName, contactEmail, contactPhone, contactCompany,
        relatedProjectId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, ticketNumber, userId || null, projectId || null, requestType, finalCategory,
      issueType || null, affectedArea || null, errorMessage || null,
      stepsToReproduce || null, expectedBehavior || null, actualBehavior || null,
      browser || null, screenshot || null, projectType || null, priority || 'normal',
      finalSubject, description || null, additionalInfo || null, website || null,
      contactName || null, contactEmail || null, contactPhone || null, contactCompany || null,
      relatedProjectId || null, now, now
    );

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);

    console.log(`Ticket created: ${ticketNumber}`);

    // Send SMS notification
    const typeLabel = requestType === 'new_project' ? 'Project Request' : requestType === 'enhancement' ? 'Enhancement Request' : 'Technical Issue';
    const smsMessage = `New Ticket: ${ticketNumber}\nType: ${typeLabel}\nFrom: ${contactName || 'Unknown'}\nSubject: ${finalSubject}\nPriority: ${priority || 'normal'}`;
    sendSmsNotification(smsMessage);

    res.status(201).json({ success: true, ticket, message: 'Ticket created successfully' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

// UPDATE ticket
app.put('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'ticketNumber');

    if (fields.length === 0) {
      return res.json({ success: true, ticket, message: 'No updates provided' });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(now, id);

    db.prepare(`UPDATE tickets SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    res.json({ success: true, ticket: updatedTicket, message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
});

// DELETE ticket
app.delete('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM tickets WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ticket' });
  }
});

// ==================== TICKET COMMENTS ROUTES ====================

// GET comments for a ticket
app.get('/api/tickets/:ticketId/comments', (req, res) => {
  try {
    const { ticketId } = req.params;
    const comments = db.prepare('SELECT * FROM ticket_comments WHERE ticketId = ? ORDER BY createdAt ASC').all(ticketId);
    res.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// POST a new comment to a ticket
app.post('/api/tickets/:ticketId/comments', (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId, userName, userRole, message } = req.body;

    // Verify ticket exists
    const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const id = 'cmt_' + uuidv4().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO ticket_comments (id, ticketId, userId, userName, userRole, message, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, ticketId, userId || null, userName || 'Anonymous', userRole || 'user', message, now);

    // Update ticket's updatedAt and set firstResponseAt if this is admin's first response
    const updates = { updatedAt: now };
    if (userRole === 'admin') {
      const existingTicket = db.prepare('SELECT firstResponseAt FROM tickets WHERE id = ?').get(ticketId);
      if (!existingTicket.firstResponseAt) {
        updates.firstResponseAt = now;
      }
    }

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), ticketId];
    db.prepare(`UPDATE tickets SET ${setClause} WHERE id = ?`).run(...values);

    const comment = db.prepare('SELECT * FROM ticket_comments WHERE id = ?').get(id);
    console.log(`Comment added to ticket ${ticketId} by ${userName}`);
    res.status(201).json({ success: true, comment, message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// ==================== USER ROUTES ====================

// GET all users (admin only)
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, name, company, phone, role, createdAt FROM users').all();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Register user
app.post('/api/users/register', (req, res) => {
  try {
    const { email, password, name, company, phone, address } = req.body;

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password, name, company, phone, street, city, state, zip, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
    `).run(
      id, email, password, name, company || '', phone || '',
      address?.street || '', address?.city || '', address?.state || '', address?.zip || '',
      now
    );

    res.status(201).json({ success: true, message: 'Account created successfully!', userId: id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Login user
app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for default admin
    if (email === 'admin@admin.com' && password === 'admin') {
      return res.json({
        success: true,
        user: {
          id: '1',
          email: 'admin@admin.com',
          name: 'Admin',
          role: 'admin',
          username: 'admin'
        }
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
});

// ==================== ADMIN USER MANAGEMENT ====================

// Admin login as user (impersonate)
app.post('/api/admin/impersonate/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return user data for admin to use (excluding password)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        company: user.company,
        street: user.street,
        city: user.city,
        state: user.state,
        zip: user.zip
      },
      message: `Now logged in as ${user.name}`
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    res.status(500).json({ success: false, message: 'Failed to impersonate user' });
  }
});

// Admin reset user password
app.post('/api/admin/users/:userId/reset-password', (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, userId);

    console.log(`Password reset for user ${user.email} by admin`);
    res.json({ success: true, message: `Password reset successfully for ${user.name}` });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Get single user (admin)
app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare('SELECT id, email, name, company, phone, street, city, state, zip, role, createdAt FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// ==================== SETTINGS ROUTES ====================

// Get all settings (admin only)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value, updatedAt FROM settings').all();
    // Convert to object for easier frontend use
    const settingsObj = {};
    settings.forEach(s => {
      // Mask sensitive values
      if (s.key === 'twilio_auth_token' && s.value) {
        settingsObj[s.key] = '***' + s.value.slice(-4);
      } else {
        settingsObj[s.key] = s.value;
      }
    });
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
app.put('/api/settings', (req, res) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const allowedKeys = ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone_number'];

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedKeys.includes(key)) continue;

      // Skip if value is masked (starts with ***)
      if (value && value.startsWith('***')) continue;

      const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
      if (existing) {
        db.prepare('UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?').run(value || '', now, key);
      } else {
        db.prepare('INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)').run(key, value || '', now);
      }
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Test SMS notification
app.post('/api/settings/test-sms', async (req, res) => {
  try {
    const result = await sendSmsNotification('Test notification from PCR Portal');
    if (result.success) {
      res.json({ success: true, message: 'Test SMS sent successfully!' });
    } else {
      res.status(400).json({ success: false, message: result.reason || result.error || 'Failed to send test SMS' });
    }
  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ success: false, message: 'Failed to send test SMS' });
  }
});

// ==================== PROJECT ROUTES ====================

// GET all projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// CREATE project
app.post('/api/projects', (req, res) => {
  try {
    const { userId, name, type, description, timeline, budgetRange, website } = req.body;

    const id = 'proj_' + uuidv4().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO projects (id, userId, name, type, description, timeline, budgetRange, website, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(id, userId, name, type || null, description || null, timeline || null, budgetRange || null, website || null, now, now);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    // Send SMS notification
    const smsMessage = `New Project: ${name}\nType: ${type || 'Unspecified'}\nBudget: ${budgetRange || 'Not set'}\nTimeline: ${timeline || 'Not set'}`;
    sendSmsNotification(smsMessage);

    res.status(201).json({ success: true, project, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// ==================== STRIPE PAYMENT ROUTES ====================

// Get Stripe publishable key
app.get('/api/payments/config', (req, res) => {
  const publishableKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_publishable_key');
  res.json({
    success: true,
    publishableKey: publishableKey?.value || null
  });
});

// Create a Stripe Checkout session
app.post('/api/payments/create-checkout', async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Get ticket details
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!ticket.proposalAmount || ticket.proposalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No payment amount set for this ticket' });
    }

    if (ticket.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This ticket has already been paid' });
    }

    // Get Stripe secret key from settings
    const secretKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_secret_key');
    if (!secretKey?.value) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }

    // Initialize Stripe with the key from settings
    const Stripe = require('stripe');
    const stripeClient = Stripe(secretKey.value);

    // Create Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ticket ${ticket.ticketNumber}`,
              description: ticket.description?.substring(0, 100) || 'Support Ticket Payment',
            },
            unit_amount: Math.round(ticket.proposalAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://zenweb.studio'}/dashboard?payment=success&ticketId=${ticketId}`,
      cancel_url: `${req.headers.origin || 'https://zenweb.studio'}/dashboard?payment=cancelled&ticketId=${ticketId}`,
      metadata: {
        ticketId: ticketId,
        ticketNumber: ticket.ticketNumber,
      },
    });

    // Store the session ID for verification
    db.prepare('UPDATE tickets SET paymentId = ? WHERE id = ?').run(session.id, ticketId);

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create checkout session' });
  }
});

// Verify payment and update ticket (called after redirect from Stripe)
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { ticketId, sessionId } = req.body;

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Get Stripe secret key from settings
    const secretKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_secret_key');
    if (!secretKey?.value) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }

    const Stripe = require('stripe');
    const stripeClient = Stripe(secretKey.value);

    // Retrieve the session to verify payment
    const session = await stripeClient.checkout.sessions.retrieve(sessionId || ticket.paymentId);

    if (session.payment_status === 'paid') {
      // Update ticket as paid
      db.prepare(`
        UPDATE tickets
        SET paymentStatus = 'paid', paidAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(new Date().toISOString(), new Date().toISOString(), ticketId);

      // Send SMS notification
      await sendSmsNotification(`💰 Payment received for ticket ${ticket.ticketNumber}! Amount: $${ticket.proposalAmount}`);

      res.json({ success: true, message: 'Payment verified successfully', paymentStatus: 'paid' });
    } else {
      res.json({ success: false, message: 'Payment not completed', paymentStatus: session.payment_status });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
});

// Stripe webhook handler (for production use)
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secretKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_secret_key');
    const webhookSecret = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_webhook_secret');

    if (!secretKey?.value) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }

    const Stripe = require('stripe');
    const stripeClient = Stripe(secretKey.value);

    let event;

    if (webhookSecret?.value) {
      const sig = req.headers['stripe-signature'];
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret.value);
    } else {
      event = req.body;
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const ticketId = session.metadata?.ticketId;

      if (ticketId) {
        db.prepare(`
          UPDATE tickets
          SET paymentStatus = 'paid', paidAt = ?, updatedAt = ?
          WHERE id = ?
        `).run(new Date().toISOString(), new Date().toISOString(), ticketId);

        const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
        if (ticket) {
          await sendSmsNotification(`💰 Payment received for ticket ${ticket.ticketNumber}! Amount: $${ticket.proposalAmount}`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Helper to get real IP
function getRealIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip || 'unknown';
}

// Track page view
app.post('/api/analytics/pageview', (req, res) => {
  try {
    const { path, referrer, sessionId } = req.body;
    const ip = getRealIP(req);
    const userAgent = req.headers['user-agent'] || '';

    // Check if IP is excluded
    const excludedIPs = db.prepare('SELECT value FROM settings WHERE key = ?').get('excluded_ips');
    if (excludedIPs) {
      const ips = excludedIPs.value.split(',').map(i => i.trim());
      if (ips.includes(ip)) {
        return res.json({ success: true, tracked: false, reason: 'IP excluded' });
      }
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    // Insert page view
    const insertView = db.prepare(`
      INSERT INTO page_views (id, path, referrer, userAgent, ip, sessionId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertView.run(id, path, referrer || '', userAgent, ip, sessionId || '', now);

    // Update or create session
    if (sessionId) {
      const existingSession = db.prepare('SELECT * FROM visitor_sessions WHERE id = ?').get(sessionId);
      if (existingSession) {
        db.prepare('UPDATE visitor_sessions SET lastVisit = ?, pageViews = pageViews + 1 WHERE id = ?')
          .run(now, sessionId);
      } else {
        db.prepare('INSERT INTO visitor_sessions (id, ip, userAgent, firstVisit, lastVisit, pageViews) VALUES (?, ?, ?, ?, ?, 1)')
          .run(sessionId, ip, userAgent, now, now);
      }
    }

    res.json({ success: true, tracked: true });
  } catch (error) {
    console.error('Error tracking pageview:', error);
    res.json({ success: false, message: error.message });
  }
});

// Get analytics data (admin only)
app.get('/api/analytics', (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    if (period === '24h') startDate.setHours(startDate.getHours() - 24);
    else if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setDate(startDate.getDate() - 7);

    const startISO = startDate.toISOString();

    // Total page views in period
    const totalViews = db.prepare(`
      SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ?
    `).get(startISO);

    // Unique visitors (by session or IP)
    const uniqueVisitors = db.prepare(`
      SELECT COUNT(DISTINCT COALESCE(sessionId, ip)) as count FROM page_views WHERE createdAt >= ?
    `).get(startISO);

    // Page views by path
    const pagesByViews = db.prepare(`
      SELECT path, COUNT(*) as views
      FROM page_views
      WHERE createdAt >= ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `).all(startISO);

    // Views by day
    const viewsByDay = db.prepare(`
      SELECT DATE(createdAt) as date, COUNT(*) as views
      FROM page_views
      WHERE createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `).all(startISO);

    // Top referrers
    const topReferrers = db.prepare(`
      SELECT referrer, COUNT(*) as count
      FROM page_views
      WHERE createdAt >= ? AND referrer != '' AND referrer IS NOT NULL
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `).all(startISO);

    // Recent visitors (last 20)
    const recentVisitors = db.prepare(`
      SELECT path, ip, userAgent, createdAt
      FROM page_views
      ORDER BY createdAt DESC
      LIMIT 20
    `).all();

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = db.prepare(`
      SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ?
    `).get(todayStart.toISOString());

    const todayVisitors = db.prepare(`
      SELECT COUNT(DISTINCT COALESCE(sessionId, ip)) as count FROM page_views WHERE createdAt >= ?
    `).get(todayStart.toISOString());

    res.json({
      success: true,
      period,
      stats: {
        totalPageViews: totalViews.count,
        uniqueVisitors: uniqueVisitors.count,
        todayPageViews: todayViews.count,
        todayVisitors: todayVisitors.count,
      },
      pagesByViews,
      viewsByDay,
      topReferrers,
      recentVisitors,
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get/Set excluded IPs
app.get('/api/analytics/excluded-ips', (req, res) => {
  try {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('excluded_ips');
    res.json({ success: true, excludedIPs: setting?.value || '' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/analytics/excluded-ips', (req, res) => {
  try {
    const { ips } = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get('excluded_ips');
    if (existing) {
      db.prepare('UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?')
        .run(ips, now, 'excluded_ips');
    } else {
      db.prepare('INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)')
        .run('excluded_ips', ips, now);
    }

    res.json({ success: true, message: 'Excluded IPs updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current visitor's IP (for admin to know their IP)
app.get('/api/analytics/my-ip', (req, res) => {
  const ip = getRealIP(req);
  res.json({ success: true, ip });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  PCR Backend API Server
  ========================================
  Server running on: http://localhost:${PORT}
  Database: ${dbPath}

  API Endpoints:
  - GET    /api/tickets          - Get all tickets
  - GET    /api/tickets/:id      - Get single ticket
  - POST   /api/tickets          - Create ticket
  - PUT    /api/tickets/:id      - Update ticket
  - DELETE /api/tickets/:id      - Delete ticket
  - GET    /api/users            - Get all users
  - POST   /api/users/register   - Register user
  - POST   /api/users/login      - Login user
  - GET    /api/health           - Health check
  ========================================
  `);
});
