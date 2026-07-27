const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Express middleware that validates JWTs issued by the LSG Auth Service.
 * Extracts userId (sub), email, and roles from the token payload.
 * Attaches them to req.lsgUser for downstream route handlers.
 *
 * IMPORTANT: This middleware should NOT be applied to health check routes (/).
 */
function jwtMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.lsgUser = {
      userId: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = jwtMiddleware;
