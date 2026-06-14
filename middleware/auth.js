const jwt = require('jsonwebtoken');

// Protect middleware: verifies JWT and attaches decoded payload to req.admin
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// adminOnly middleware: requires `req.admin.role` to be an admin string
const adminOnly = (req, res, next) => {
  // Expect protect to run before adminOnly so req.admin exists
  const role = req.admin && req.admin.role;
  if (!role) return res.status(403).json({ error: 'Forbidden' });
  if (role === 'admin' || role === 'super_admin' || role === 'support') return next();
  return res.status(403).json({ error: 'Admin access required' });
};

// Export protect as the default middleware function (so `require('./auth')` works),
// and attach named helpers so callers can destructure: `const { protect, adminOnly } = require('./auth')`.
module.exports = protect;
module.exports.protect = protect;
module.exports.adminOnly = adminOnly;
