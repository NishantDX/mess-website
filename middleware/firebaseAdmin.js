const admin = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Contains uid, email, etc.
    console.log(decodedToken.uid)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};




const Admin = require('../models/adminModel');

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await Admin.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(403).json({ message: 'Forbidden: Not an admin' });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = {verifyToken, verifyAdmin};