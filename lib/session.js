// Simple session management for Vercel
// In production, use a dedicated session store like Redis

const sessions = new Map();

export function withSessionRoute(handler) {
  return async (req, res) => {
    // Get session from cookie
    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
      .split('; ')
      .find(c => c.startsWith('chronocode_session='));
    
    const sessionId = sessionCookie ? sessionCookie.split('=')[1] : null;
    
    // Initialize session object
    req.session = sessions.get(sessionId) || { user: null };
    
    // Call handler
    const result = await handler(req, res);
    
    // Save session
    if (req.session) {
      const sid = sessionId || generateSessionId();
      sessions.set(sid, req.session);
      const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
      res.setHeader('Set-Cookie', `chronocode_session=${sid}; Path=/; ${secure}HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`);
    }
    
    return result;
  };
}

export function withSessionSsr(handler) {
  return handler;
}

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default { withSessionRoute, withSessionSsr };
