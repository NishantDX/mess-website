const { verifyIdToken } = require("./firebaseAdmin");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decodedToken; // Attach user details to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = authMiddleware;
