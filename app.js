const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());
app.use(compression());

const allowedOrigins = (process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Ensure MongoDB connection on serverless / Vercel deployments
app.use(async (req, res, next) => {
    try {
        if (require('mongoose').connection.readyState === 1) {
            return next();
        }

        await connectDB();
        return next();
    } catch (err) {
        console.error('❌ Database connection failed (middleware):', err.message || err);
        return res.status(502).json({ success: false, message: 'Database connection failed', error: err.message || String(err) });
    }
});

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
app.use("/api/auth/parents", require("./routes/parent.routes"));
app.use("/api/auth/students", require("./routes/student.routes"));
app.use("/api/inqury", require("./routes/inqury.routes"));
app.use("/api/reviews", require("./routes/reviews.routes"));

// Health check
app.get("/", async (req, res) => {
    try {
        res.json({
            status: "running",
            mongoReadyState: mongoose.connection.readyState,
            mongoHost: mongoose.connection.host || null,
            mongoDatabase: mongoose.connection.name || null,
            mongoUriExists: Boolean(process.env.MONGO_URI),
        });
    } catch (error) {
        console.error("Health check MongoDB error:", error);

        res.status(500).json({
            status: "running",
            mongoReadyState: mongoose.connection.readyState,
            mongoUriExists: Boolean(process.env.MONGO_URI),
            mongoError: error.message,
        });
    }
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
