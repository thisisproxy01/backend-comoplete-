require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./db");

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && (err.stack || err.message || err));
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const start = async () => {
    try {
        await connectDB();
    } catch (err) {
        console.error('Error during initial DB connect:', err && (err.message || err));
    }

    const app = express();

    // Configure CORS: prefer an explicit FRONTEND_URL (set this on Render/Vercel).
    const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    if (FRONTEND_URL) {
        app.use(cors({ origin: FRONTEND_URL }));
        console.log('🔒 CORS enabled for:', FRONTEND_URL);
    } else {
        // Fallback: permissive CORS for testing (not recommended for production)
        app.use(cors());
        console.warn('⚠️  FRONTEND_URL not set; CORS is permissive. Set FRONTEND_URL in Render for production.');
    }

    app.use(helmet());
    app.use(express.json());

    app.get("/", (req, res) => {
        res.json({ status: "PlayBeat Backend Online" });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

start();
