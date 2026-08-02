const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/auth", require("./routes/adminAuthRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/faq", require("./routes/faqRoutes"));
app.use("/api/admin/queries", require("./routes/adminQueriesRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

  // Test Route
app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "API is running and MongoDB is connected!",
      timestamp: new Date().toISOString(),
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:5173`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

