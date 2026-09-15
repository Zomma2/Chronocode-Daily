// Stateless, cookie-based sessions via iron-session. Session data is sealed
// (encrypted + signed) directly into the cookie, so it survives across
// Vercel's serverless function instances/cold starts (an in-memory Map does not).
import { getIronSession } from 'iron-session';

const sessionOptions = {
  cookieName: 'chronocode_session',
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  },
};

export function withSessionRoute(handler) {
  return async (req, res) => {
    req.session = await getIronSession(req, res, sessionOptions);
    if (req.session.user === undefined) req.session.user = null;

    // Wrap res.json so any handler mutating req.session.user gets it sealed
    // into the Set-Cookie header before the response body is sent.
    const originalJson = res.json;
    res.json = async function (data) {
      await req.session.save();
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
}

export function withSessionSsr(handler) {
  return handler;
}

export default { withSessionRoute, withSessionSsr };

