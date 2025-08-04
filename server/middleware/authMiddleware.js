import User from "../models/User.js";

// Middleware to check if the user is authenticated
export const protect = async (req, res, next) => {
    try {
        console.log("=== AUTH MIDDLEWARE CALLED ===");
        console.log("Request headers:", req.headers);
        
        // Check if req.auth exists
        if (!req.auth) {
            console.error("❌ req.auth is not available - Clerk middleware may not be properly configured");
            return res.json({success: false, message: "Authentication middleware not configured"});
        }
        
        const { userId } = req.auth();
        console.log("User ID from auth:", userId);
        
        if (!userId) {
            console.log("No userId found, returning not authenticated");
            return res.json({success: false, message: "not authenticated"});
        } else {
            console.log("Looking for user in database with ID:", userId);
            const user = await User.findById(userId);
            console.log("User found in database:", user);
            
            if (!user) {
                console.log("User not found in database, returning User not found");
                return res.json({success: false, message: "User not found"});
            }
            console.log("User found, setting req.user and calling next()");
            req.user = user;
            next()
        }
    } catch (error) {
        console.error("=== AUTH MIDDLEWARE ERROR ===");
        console.error("Auth middleware error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        return res.json({success: false, message: "Authentication error"});
    }
};

// Middleware for user creation - only checks if user is authenticated via Clerk
export const protectCreate = async (req, res, next) => {
    try {
        console.log("=== CREATE AUTH MIDDLEWARE CALLED ===");
        console.log("Request headers:", req.headers);
        
        // Check if req.auth exists
        if (!req.auth) {
            console.error("❌ req.auth is not available - Clerk middleware may not be properly configured");
            return res.json({success: false, message: "Authentication middleware not configured"});
        }
        
        const { userId } = req.auth();
        console.log("User ID from auth:", userId);
        
        if (!userId) {
            console.log("No userId found, returning not authenticated");
            return res.json({success: false, message: "not authenticated"});
        }
        
        console.log("User authenticated via Clerk, proceeding to create user");
        req.userId = userId; // Store userId for the controller to use
        next();
    } catch (error) {
        console.error("=== CREATE AUTH MIDDLEWARE ERROR ===");
        console.error("Create auth middleware error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        return res.json({success: false, message: "Authentication error"});
    }
};