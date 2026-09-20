require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/student");
const attendanceRoutes = require("./routes/attendanceRoutes");
const menuRoutes = require("./routes/menuRoutes");
const feesRoutes = require("./routes/feesRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cronRoutes = require("./routes/cronRoutes");

const paymentRoutes = require("./routes/paymentRoutes");
const express = require("express"); //step 1
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const CronService = require("./services/cronService");
const AttendanceSimulator = require("./services/attendanceSimulator");
require("./config/redis"); // optional cache — no-op unless REDIS_URL is set

const app = express(); //step 2
app.use(express.json());
//require('dotenv').config();
app.use(
  cors({
    origin: "*",
  })
);

// Socket.IO needs the raw HTTP server, not just the Express app, so requests
// can be upgraded to a WebSocket connection.
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
app.set("io", io); // controllers reach this via req.app.get('io')

io.on("connection", (socket) => {
  console.log("[socket] client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("[socket] client disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      //step 3
      console.log("listening on port 5000");

      // Initialize and start cron jobs
      const cronService = new CronService();
      cronService.startCronJobs();

      // Demo-only: daily synthetic attendance. No-op unless SIMULATE_ATTENDANCE=true.
      new AttendanceSimulator().start();
    });
  })
  .catch((err) => {
    console.log(err);
  });
app.use("/api/students/", userRoutes);
app.use("/api/attendance/", attendanceRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cron", cronRoutes);
