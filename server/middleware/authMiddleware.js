import User from "../models/User.js";


// Middleware to check if the user is authenticated
export const protect = async (req, res, next) => {
    try {
        console.log("=== AUTH MIDDLEWARE CALLED ===");
        const { userId } = req.auth();
        console.log("User ID from auth:", userId);
        
        if (!userId) {
            console.log("No userId found, returning not authenticated");
            return res.json({success:false, message: "not authenticated"});
        } else {
            console.log("Looking for user in database with ID:", userId);
            const user = await User.findById(userId);
            console.log("User found in database:", user);
            
            if (!user) {
                console.log("User not found in database, returning User not found");
                return res.json({success:false, message: "User not found"});
            }
            console.log("User found, setting req.user and calling next()");
            req.user = user;
            next()
        }
    } catch (error) {
        console.error("=== AUTH MIDDLEWARE ERROR ===");
        console.error("Auth middleware error:", error);
        console.error("Error stack:", error.stack);
        return res.json({success:false, message: "Authentication error"});
    }
};