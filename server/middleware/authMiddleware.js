import User from "../models/User.js";


// Middleware to check if the user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.json({success:false, message: "not authenticated"});
        } else {
            const user = await User.findById(userId);
            if (!user) {
                return res.json({success:false, message: "User not found"});
            }
            req.user = user;
            next()
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.json({success:false, message: "Authentication error"});
    }
};