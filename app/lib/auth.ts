import crypto from 'crypto';

// Get environment variables
const INVENTORY_PASSWORD = process.env.INVENTORY_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';

// Session configuration
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate a session token tied to the current password
 * When password changes, all old tokens become invalid
 */
export function generateSessionToken(password: string): string {
  // Create hash of password (this changes when password changes)
  const passwordHash = crypto
    .createHash('sha256')
    .update(password + SESSION_SECRET)
    .digest('hex');
  
  // Create session token using HMAC
  const timestamp = Date.now().toString();
  const token = crypto
    .createHmac('sha256', passwordHash)
    .update(timestamp)
    .digest('hex');
  
  // Format: passwordHashPrefix.token.timestamp
  // We only store first 16 chars of hash for validation
  return `${passwordHash.substring(0, 16)}.${token}.${timestamp}`;
}

/**
 * Validate a session token against the current password
 * Returns true if token is valid and not expired
 */
export function validateSessionToken(token: string): boolean {
  if (!INVENTORY_PASSWORD) {
    console.error('INVENTORY_PASSWORD not set');
    return false;
  }

  try {
    const [hashPrefix, tokenPart, timestamp] = token.split('.');
    
    if (!hashPrefix || !tokenPart || !timestamp) {
      return false;
    }
    
    // Get current password hash
    const currentHash = crypto
      .createHash('sha256')
      .update(INVENTORY_PASSWORD + SESSION_SECRET)
      .digest('hex');
    
    // Check if hash prefix matches (password hasn't changed)
    if (!currentHash.startsWith(hashPrefix)) {
      return false; // Password changed, token invalid
    }
    
    // Verify token was created with this password
    const expectedToken = crypto
      .createHmac('sha256', currentHash)
      .update(timestamp)
      .digest('hex');
    
    if (tokenPart !== expectedToken) {
      return false; // Token tampered or invalid
    }
    
    // Check expiration
    const tokenAge = Date.now() - parseInt(timestamp);
    
    if (tokenAge > SESSION_MAX_AGE) {
      return false; // Token expired
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Verify password matches environment variable
 */
export function verifyPassword(password: string): boolean {
  if (!INVENTORY_PASSWORD) {
    console.error('INVENTORY_PASSWORD not set in environment');
    return false;
  }
  
  return password === INVENTORY_PASSWORD;
}

/**
 * Get session cookie configuration
 */
export function getSessionCookieConfig() {
  return {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' as const, // CSRF protection
    maxAge: SESSION_MAX_AGE / 1000, // Convert to seconds (7 days)
    path: '/', // Available across entire site
  };
}
