


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
        const { userId } = req.auth();
        const { email, username, image } = req.body;
        
        console.log("Creating user with ID:", userId);
        console.log("User data:", { email, username, image });
        
        // Check if user already exists
        let user = await User.findById(userId);
        
        if (!user) {
            console.log("User not found, creating new user...");
            // Create new user
            user = await User.create({
                _id: userId,
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
        console.error("Error creating user:", error);
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
