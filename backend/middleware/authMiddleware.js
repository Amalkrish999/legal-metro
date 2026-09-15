const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || !token.startsWith('dummy-token-')) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  next();
};

  // If we had real JWT, we would decode it here and attach user to req
  // req.user = decodedUser;

module.exports = authMiddleware;
