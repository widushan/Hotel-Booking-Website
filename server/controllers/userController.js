


import User from "../models/User.js";

// GET api/user/

export const getUserData = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        
        const role = req.user.role;
        const recentSearchCities = req.user.recentSearchedCities;
        res.json({
            success: true,
            role,
            recentSearchCities
        })
        
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Create user if doesn't exist
export const createUser = async (req, res) => {
    try {
        console.log("=== CREATE USER ENDPOINT CALLED ===");
        console.log("Request body:", req.body);
        console.log("User ID from middleware:", req.userId);
        
        // Use userId from middleware
        const userId = req.userId;
        if (!userId) {
            console.log("No userId found in middleware");
            return res.json({
                success: false,
                message: "Not authenticated"
            });
        }
        
        const { email, username, image } = req.body;
        
        console.log("Creating user with ID:", userId);
        console.log("User data:", { email, username, image });
        
        // Check if user already exists
        let user = await User.findById(userId);
        console.log("Existing user found:", user);
        
        if (!user) {
            console.log("User not found, creating new user...");
            // Create new user
            user = await User.create({
                _id: userId,
                clerkId: userId, // Use the same ID as clerkId
                email,
                username,
                image,
                recentSearchedCities: []
            });
            console.log("User created successfully:", user);
        } else {
            console.log("User already exists:", user);
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error("=== CREATE USER ERROR ===");
        console.error("Error creating user:", error);
        console.error("Error stack:", error.stack);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// Manual user creation endpoint (for testing)
export const createUserManually = async (req, res) => {
    try {
        const { userId, email, username, image } = req.body;
        
        console.log("Manual user creation with ID:", userId);
        console.log("User data:", { email, username, image });
        
        // Check if user already exists
        let user = await User.findById(userId);
        
        if (!user) {
            console.log("User not found, creating new user manually...");
            // Create new user
            user = await User.create({
                _id: userId,
                clerkId: userId, // Use the same ID as clerkId
                email,
                username,
                image,
                recentSearchedCities: []
            });
            console.log("User created successfully:", user);
        } else {
            console.log("User already exists:", user);
        }
        
        res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error("Error creating user manually:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// Fix existing users by adding clerkId
export const fixExistingUsers = async (req, res) => {
    try {
        console.log("=== FIXING EXISTING USERS ===");
        
        // Find all users without clerkId
        const users = await User.find({ clerkId: { $exists: false } });
        console.log("Users without clerkId:", users);
        
        for (const user of users) {
            console.log("Updating user:", user._id);
            await User.findByIdAndUpdate(user._id, {
                clerkId: user._id // Use _id as clerkId
            });
        }
        
        console.log("All users fixed successfully");
        res.json({
            success: true,
            message: "Users fixed successfully"
        });
        
    } catch (error) {
        console.error("Error fixing users:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
}


// Store user recent searched cities
export const storeRecentSearchedCities = async (req, res)=>{
  try {
    const {recentSearchedCity} = req.body;
    const user = await req.user;

    if(user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCity)
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchedCity)
    }

    await user.save();
    res.json({success: true, message: "City added"});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}
