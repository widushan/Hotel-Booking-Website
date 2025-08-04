import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "../server/configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js'
import userRouter from './routes/userRoutes.js'
import hotelRouter from './routes/hotelRoutes.js'
import roomRouter from './routes/roomRoutes.js'
import connectCloudinary from "./configs/cloudinary.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Check for required environment variables
const requiredEnvVars = ['MONGODB_URI', 'CLERK_SECRET_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

console.log("✅ Environment variables loaded successfully");

// Connect to database
connectDB();

// Connect to Cloudinary
connectCloudinary();

const app = express()

// Enable CORS with specific options
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Middleware for parsing JSON (except for webhooks)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/bookings/stripe-webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Clerk middleware with error handling
try {
    app.use(clerkMiddleware());
    console.log("✅ Clerk middleware configured successfully");
} catch (error) {
    console.error("❌ Failed to configure Clerk middleware:", error);
    process.exit(1);
}

// API routes
app.get('/', (req, res) => {
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
});

app.use('/api/clerk', clerkWebhooks)
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
});
