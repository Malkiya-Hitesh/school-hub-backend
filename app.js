const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security
app.use(helmet());
app.use(compression());

app.use(
cors({
origin: true,
credentials: true,
})
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Rate limiters
const generalLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 200,
standardHeaders: true,
legacyHeaders: false,
message: {
success: false,
message: "Too many requests. Please try later.",
},
});

const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 20,
standardHeaders: true,
legacyHeaders: false,
message: {
success: false,
message: "Too many auth attempts. Please wait.",
},
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Routes
app.use("/api/schools", require("./routes/school.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/claim", require("./routes/claim.routes"));

// Health check
app.get("/", (req, res) => {
res.json({
message: "🏫 Gujarat School Hub API",
status: "running",
version: "1.0.0",
});
});

// 404 handler
app.use((req, res) => {
res.status(404).json({
success: false,
message: "Route not found",
});
});

// Global error handler
app.use(errorHandler);

module.exports = app;
