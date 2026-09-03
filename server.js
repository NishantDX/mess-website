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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
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
