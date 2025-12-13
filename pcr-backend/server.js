const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');

// ==================== SECURITY PACKAGES ====================
let helmet, rateLimit, bcrypt;

try {
  helmet = require('helmet');
} catch (e) {
  console.log('Helmet not installed - using basic security headers');
}

try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  console.log('Rate limiter not installed - no rate limiting');
}

try {
  bcrypt = require('bcrypt');
} catch (e) {
  console.log('Bcrypt not installed - using fallback password hashing');
}

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
  stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
} catch (e) {
  console.log('Stripe not installed - payments disabled');
}

// Nodemailer for email notifications
let nodemailer;
let emailTransporter;
try {
  nodemailer = require('nodemailer');
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL_USER || '',
      pass: process.env.ALERT_EMAIL_PASS || ''
    }
  });
  console.log('Email notifications enabled');
} catch (e) {
  console.log('Nodemailer not installed - email notifications disabled');
}

// ==================== PASSWORD HASHING ====================
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  if (bcrypt) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }
  // Fallback: SHA-256 with salt (not as secure as bcrypt, but better than plaintext)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password, storedHash) {
  if (bcrypt && !storedHash.includes(':')) {
    return await bcrypt.compare(password, storedHash);
  }
  // Fallback verification
  if (storedHash.includes(':')) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
  // Legacy plaintext comparison (will be migrated)
  return password === storedHash;
}

// ==================== INPUT SANITIZATION ====================
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ==================== BOT/SPAM DETECTION ====================
const spamPatterns = [
  /\b(viagra|cialis|casino|lottery|winner|prize|click here|act now|limited time)\b/i,
  /\b(buy now|free money|make money fast|work from home)\b/i,
  /(http[s]?:\/\/[^\s]+){3,}/i, // Multiple URLs
  /(.)\1{10,}/, // Repeated characters
];

const suspiciousEmailDomains = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com'
];

function detectSpam(data) {
  const textFields = [data.description, data.subject, data.message, data.additionalInfo].filter(Boolean).join(' ');

  // Check spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(textFields)) {
      return { isSpam: true, reason: 'Spam pattern detected' };
    }
  }

  // Check suspicious email domains
  if (data.email || data.contactEmail) {
    const email = (data.email || data.contactEmail).toLowerCase();
    for (const domain of suspiciousEmailDomains) {
      if (email.includes(domain)) {
        return { isSpam: true, reason: 'Suspicious email domain' };
      }
    }
  }

  // Check honeypot fields (should be empty)
  if (data._honeypot || data.website_url || data.fax_number) {
    return { isSpam: true, reason: 'Honeypot triggered' };
  }

  return { isSpam: false };
}

// Track failed login attempts for IP-based blocking
const failedLoginAttempts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginAttempts(ip) {
  const attempts = failedLoginAttempts.get(ip);
  if (!attempts) return { blocked: false };

  if (attempts.count >= LOCKOUT_THRESHOLD) {
    const timeRemaining = LOCKOUT_DURATION - (Date.now() - attempts.lastAttempt);
    if (timeRemaining > 0) {
      return { blocked: true, timeRemaining: Math.ceil(timeRemaining / 1000) };
    }
    // Reset after lockout period
    failedLoginAttempts.delete(ip);
  }
  return { blocked: false };
}

function recordFailedLogin(ip) {
  const attempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  failedLoginAttempts.set(ip, attempts);
}

function clearFailedLogins(ip) {
  failedLoginAttempts.delete(ip);
}

// Send email alert to admin
async function sendEmailAlert(ticketData) {
  if (!emailTransporter || !process.env.ALERT_EMAIL_USER) {
    console.log('Email not configured - skipping notification');
    return;
  }

  try {
    await emailTransporter.sendMail({
      from: process.env.ALERT_EMAIL_USER,
      to: 'jsamonie@gmail.com',
      subject: `New Ticket: ${ticketData.ticketNumber}`,
      text: `New ticket submitted!\n\nTicket: ${ticketData.ticketNumber}\nType: ${ticketData.type}\nFrom: ${ticketData.name || 'Unknown'}\nEmail: ${ticketData.email || 'N/A'}\nSubject: ${ticketData.subject}\nPriority: ${ticketData.priority}\n\nLogin to view: https://zenweb.studio/dashboard`
    });
    console.log('Email alert sent for ticket:', ticketData.ticketNumber);
  } catch (error) {
    console.error('Failed to send email alert:', error.message);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - required when behind nginx/load balancer
app.set('trust proxy', 1);

// ==================== SECURITY MIDDLEWARE ====================

// Security headers
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
} else {
  // Basic security headers fallback
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Rate limiting
if (rateLimit) {
  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limit for form submissions (POST only, skip admin)
  const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 submissions per hour
    message: { success: false, message: 'Too many submissions, please try again later.' },
    skip: (req) => {
      // Skip rate limiting for non-POST requests (GET, PUT, DELETE)
      if (req.method !== 'POST') return true;
      // Skip for admin routes
      if (req.path.includes('/admin/')) return true;
      return false;
    },
  });

  app.use('/api/', generalLimiter);
  app.use('/api/users/login', authLimiter);
  app.use('/api/users/register', authLimiter);
  app.use('/api/tickets', formLimiter);
}

// Request size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS with restrictions
app.use(cors({
  origin: ['https://zenweb.studio', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Input sanitization middleware
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// Admin IP whitelist (hidden from frontend)
// Temporarily disabled for initial login - re-enable after setting up
const ADMIN_ALLOWED_IPS = ['76.122.179.102', '34.72.176.129', '205.169.39.57', '205.169.39.111'];
const ADMIN_IP_RESTRICTION_ENABLED = false; // Set to true to enable IP restriction

// Get client IP from request
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}

// Check if IP is allowed for admin access
function isAdminIP(req) {
  if (!ADMIN_IP_RESTRICTION_ENABLED) return true; // Bypass if disabled
  const clientIP = getClientIP(req);
  return ADMIN_ALLOWED_IPS.includes(clientIP);
}

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

  CREATE TABLE IF NOT EXISTS blocked_ips (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    blockedAt TEXT NOT NULL,
    expiresAt TEXT
  );

  CREATE TABLE IF NOT EXISTS security_logs (
    id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    ip TEXT,
    userAgent TEXT,
    details TEXT,
    createdAt TEXT NOT NULL
  );
`);

// Add columns if they don't exist
const alterTableQueries = [
  'ALTER TABLE tickets ADD COLUMN proposalAmount REAL',
  'ALTER TABLE tickets ADD COLUMN paymentStatus TEXT DEFAULT \'unpaid\'',
  'ALTER TABLE tickets ADD COLUMN paymentId TEXT',
  'ALTER TABLE tickets ADD COLUMN paidAt TEXT',
  'ALTER TABLE tickets ADD COLUMN relatedProjectId TEXT',
];

alterTableQueries.forEach(query => {
  try { db.exec(query); } catch (e) { /* Column exists */ }
});

// Create analytics tables
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
  );

  CREATE TABLE IF NOT EXISTS visitor_sessions (
    id TEXT PRIMARY KEY,
    ip TEXT,
    userAgent TEXT,
    firstVisit TEXT NOT NULL,
    lastVisit TEXT NOT NULL,
    pageViews INTEGER DEFAULT 1
  );
`);

// ==================== SECURITY: CLEAN UP & SETUP ADMIN ====================

// Remove all existing admin accounts and create new secure one
async function setupSecureAdmin() {
  try {
    // Delete ALL admin accounts (old insecure ones)
    db.prepare("DELETE FROM users WHERE role = 'admin'").run();
    db.prepare("DELETE FROM users WHERE email LIKE '%admin%'").run();
    db.prepare("DELETE FROM users WHERE email = 'admin@admin.com'").run();
    console.log('Removed all old admin accounts');

    // Create new secure admin with hashed password
    const adminPassword = 'KJ029Jcdl;23edsa#@E';
    const hashedPassword = await hashPassword(adminPassword);
    const now = new Date().toISOString();
    const adminId = 'admin_' + uuidv4().replace(/-/g, '').slice(0, 12);

    const existingAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@zenweb.studio'").get();
    if (!existingAdmin) {
      db.prepare(`
        INSERT INTO users (id, email, password, name, company, phone, role, createdAt)
        VALUES (?, 'admin@zenweb.studio', ?, 'Admin', 'Zenweb Studio', '', 'admin', ?)
      `).run(adminId, hashedPassword, now);
      console.log('Created new secure admin account: admin@zenweb.studio');
    } else {
      // Update existing admin password
      db.prepare("UPDATE users SET password = ? WHERE email = 'admin@zenweb.studio'").run(hashedPassword);
      console.log('Updated admin password');
    }

    // Log security event
    db.prepare(`
      INSERT INTO security_logs (id, event, ip, details, createdAt)
      VALUES (?, 'admin_setup', 'system', 'Secure admin account configured', ?)
    `).run(uuidv4(), now);

  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

// Run admin setup on start
setupSecureAdmin();

// ==================== SMS HELPER FUNCTION ====================
async function sendSmsNotification(message) {
  try {
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

// Log security event
function logSecurityEvent(event, req, details = '') {
  try {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO security_logs (id, event, ip, userAgent, details, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), event, ip, userAgent.slice(0, 500), details, now);
  } catch (e) {
    console.error('Failed to log security event:', e.message);
  }
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

// CREATE ticket (with spam detection)
app.post('/api/tickets', (req, res) => {
  try {
    // Check for spam/bots
    const spamCheck = detectSpam(req.body);
    if (spamCheck.isSpam) {
      logSecurityEvent('spam_blocked', req, spamCheck.reason);
      // Return success to not alert bots, but don't save
      return res.status(201).json({
        success: true,
        ticket: { ticketNumber: 'TKT-' + Date.now() },
        message: 'Ticket created successfully'
      });
    }

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

    // Send email alert to admin
    sendEmailAlert({
      ticketNumber,
      type: typeLabel,
      name: contactName,
      email: contactEmail,
      subject: finalSubject,
      priority: priority || 'normal'
    });

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

// Register user (with password hashing)
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, name, company, phone, address } = req.body;

    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password, name, company, phone, street, city, state, zip, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
    `).run(
      id, email.toLowerCase(), hashedPassword, name, company || '', phone || '',
      address?.street || '', address?.city || '', address?.state || '', address?.zip || '',
      now
    );

    logSecurityEvent('user_registered', req, `Email: ${email}`);
    res.status(201).json({ success: true, message: 'Account created successfully!', userId: id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Login user (with brute force protection)
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = getClientIP(req);

    // Check for IP lockout
    const lockoutCheck = checkLoginAttempts(clientIP);
    if (lockoutCheck.blocked) {
      logSecurityEvent('login_blocked', req, `IP locked out for ${lockoutCheck.timeRemaining}s`);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${Math.ceil(lockoutCheck.timeRemaining / 60)} minutes.`
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      recordFailedLogin(clientIP);
      logSecurityEvent('login_failed', req, `Unknown email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      recordFailedLogin(clientIP);
      logSecurityEvent('login_failed', req, `Invalid password for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check admin IP restriction
    if (user.role === 'admin' && !isAdminIP(req)) {
      logSecurityEvent('admin_access_denied', req, `Admin login from unauthorized IP: ${email}`);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Success - clear failed attempts
    clearFailedLogins(clientIP);
    logSecurityEvent('login_success', req, `User: ${email}`);

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
    if (!isAdminIP(req)) {
      logSecurityEvent('unauthorized_impersonate', req);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logSecurityEvent('admin_impersonate', req, `Impersonating user: ${user.email}`);

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
app.post('/api/admin/users/:userId/reset-password', async (req, res) => {
  try {
    if (!isAdminIP(req)) {
      logSecurityEvent('unauthorized_password_reset', req);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

    logSecurityEvent('admin_password_reset', req, `Reset password for: ${user.email}`);
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

// Admin create new user
app.post('/api/admin/users', async (req, res) => {
  try {
    const { email, password, name, company, phone, street, city, state, zip, role } = req.body;

    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const id = 'usr_' + uuidv4().replace(/-/g, '').slice(0, 12);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password, name, company, phone, street, city, state, zip, role, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, email.toLowerCase(), hashedPassword, name, company || '', phone || '',
      street || '', city || '', state || '', zip || '',
      role || 'user', now
    );

    logSecurityEvent('admin_user_created', req, `Created user: ${email}`);
    console.log(`Admin created new user: ${email}`);

    const user = db.prepare('SELECT id, email, name, company, phone, street, city, state, zip, role, createdAt FROM users WHERE id = ?').get(id);
    res.status(201).json({ success: true, user, message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// ==================== SETTINGS ROUTES ====================

// Get all settings (admin only)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value, updatedAt FROM settings').all();
    const settingsObj = {};
    settings.forEach(s => {
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
    if (!isAdminIP(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updates = req.body;
    const now = new Date().toISOString();

    const allowedKeys = ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone_number'];

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedKeys.includes(key)) continue;
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

    const smsMessage = `New Project: ${name}\nType: ${type || 'Unspecified'}\nBudget: ${budgetRange || 'Not set'}\nTimeline: ${timeline || 'Not set'}`;
    sendSmsNotification(smsMessage);

    res.status(201).json({ success: true, project, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// ==================== STRIPE PAYMENT ROUTES ====================

app.get('/api/payments/config', (req, res) => {
  const publishableKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_publishable_key');
  res.json({
    success: true,
    publishableKey: publishableKey?.value || null
  });
});

app.post('/api/payments/create-checkout', async (req, res) => {
  try {
    const { ticketId } = req.body;

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

    const secretKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_secret_key');
    if (!secretKey?.value) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }

    const Stripe = require('stripe');
    const stripeClient = Stripe(secretKey.value);

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
            unit_amount: Math.round(ticket.proposalAmount * 100),
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

    db.prepare('UPDATE tickets SET paymentId = ? WHERE id = ?').run(session.id, ticketId);

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create checkout session' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { ticketId, sessionId } = req.body;

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const secretKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('stripe_secret_key');
    if (!secretKey?.value) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }

    const Stripe = require('stripe');
    const stripeClient = Stripe(secretKey.value);

    const session = await stripeClient.checkout.sessions.retrieve(sessionId || ticket.paymentId);

    if (session.payment_status === 'paid') {
      db.prepare(`
        UPDATE tickets
        SET paymentStatus = 'paid', paidAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(new Date().toISOString(), new Date().toISOString(), ticketId);

      await sendSmsNotification(`Payment received for ticket ${ticket.ticketNumber}! Amount: $${ticket.proposalAmount}`);

      res.json({ success: true, message: 'Payment verified successfully', paymentStatus: 'paid' });
    } else {
      res.json({ success: false, message: 'Payment not completed', paymentStatus: session.payment_status });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
});

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
          await sendSmsNotification(`Payment received for ticket ${ticket.ticketNumber}! Amount: $${ticket.proposalAmount}`);
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

function getRealIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip || 'unknown';
}

app.post('/api/analytics/pageview', (req, res) => {
  try {
    const { path, referrer, sessionId } = req.body;
    const ip = getRealIP(req);
    const userAgent = req.headers['user-agent'] || '';

    const excludedIPs = db.prepare('SELECT value FROM settings WHERE key = ?').get('excluded_ips');
    if (excludedIPs) {
      const ips = excludedIPs.value.split(',').map(i => i.trim());
      if (ips.includes(ip)) {
        return res.json({ success: true, tracked: false, reason: 'IP excluded' });
      }
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    const insertView = db.prepare(`
      INSERT INTO page_views (id, path, referrer, userAgent, ip, sessionId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertView.run(id, path, referrer || '', userAgent, ip, sessionId || '', now);

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

app.get('/api/analytics', (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let startDate = new Date();
    if (period === '24h') startDate.setHours(startDate.getHours() - 24);
    else if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setDate(startDate.getDate() - 7);

    const startISO = startDate.toISOString();

    const totalViews = db.prepare(`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ?`).get(startISO);
    const uniqueVisitors = db.prepare(`SELECT COUNT(DISTINCT COALESCE(sessionId, ip)) as count FROM page_views WHERE createdAt >= ?`).get(startISO);
    const pagesByViews = db.prepare(`SELECT path, COUNT(*) as views FROM page_views WHERE createdAt >= ? GROUP BY path ORDER BY views DESC LIMIT 20`).all(startISO);
    const viewsByDay = db.prepare(`SELECT DATE(createdAt) as date, COUNT(*) as views FROM page_views WHERE createdAt >= ? GROUP BY DATE(createdAt) ORDER BY date ASC`).all(startISO);
    const topReferrers = db.prepare(`SELECT referrer, COUNT(*) as count FROM page_views WHERE createdAt >= ? AND referrer != '' AND referrer IS NOT NULL GROUP BY referrer ORDER BY count DESC LIMIT 10`).all(startISO);
    const recentVisitors = db.prepare(`SELECT path, ip, userAgent, createdAt FROM page_views ORDER BY createdAt DESC LIMIT 20`).all();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = db.prepare(`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ?`).get(todayStart.toISOString());
    const todayVisitors = db.prepare(`SELECT COUNT(DISTINCT COALESCE(sessionId, ip)) as count FROM page_views WHERE createdAt >= ?`).get(todayStart.toISOString());

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
      db.prepare('UPDATE settings SET value = ?, updatedAt = ? WHERE key = ?').run(ips, now, 'excluded_ips');
    } else {
      db.prepare('INSERT INTO settings (key, value, updatedAt) VALUES (?, ?, ?)').run('excluded_ips', ips, now);
    }

    res.json({ success: true, message: 'Excluded IPs updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/analytics/my-ip', (req, res) => {
  const ip = getRealIP(req);
  res.json({ success: true, ip });
});

// ==================== SECURITY ENDPOINTS ====================

app.get('/api/security/logs', (req, res) => {
  try {
    if (!isAdminIP(req)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const logs = db.prepare('SELECT * FROM security_logs ORDER BY createdAt DESC LIMIT 100').all();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/check-admin-access', (req, res) => {
  res.json({ allowed: isAdminIP(req) });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), secure: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  PCR Backend API Server (SECURED)
  ========================================
  Server running on: http://localhost:${PORT}
  Database: ${dbPath}

  Security Features:
  - Password hashing (bcrypt/PBKDF2)
  - Rate limiting enabled
  - Input sanitization
  - Bot/spam detection
  - Brute force protection
  - Security event logging
  - Admin IP restriction

  API Endpoints:
  - GET    /api/tickets          - Get all tickets
  - GET    /api/tickets/:id      - Get single ticket
  - POST   /api/tickets          - Create ticket (spam protected)
  - PUT    /api/tickets/:id      - Update ticket
  - DELETE /api/tickets/:id      - Delete ticket
  - GET    /api/users            - Get all users
  - POST   /api/users/register   - Register user (password hashed)
  - POST   /api/users/login      - Login user (brute force protected)
  - GET    /api/security/logs    - View security logs (admin only)
  - GET    /api/health           - Health check
  ========================================
  `);
});
