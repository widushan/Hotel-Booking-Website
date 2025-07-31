
import User from "../models/User.js";
import { Webhook } from "svix";


const clerkWebhooks = async (req,res)=>{
    console.log("=== CLERK WEBHOOK RECEIVED ===");
    console.log("CLERK_WEBHOOK_SECRET:", process.env.CLERK_WEBHOOK_SECRET);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try{
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        
        console.log("Headers:", headers);
        await whook.verify(JSON.stringify(req.body), headers)
        console.log("Webhook verification successful");

        // Getting data from request body
        const { data, type } = req.body;
        console.log("Webhook type:", type);
        console.log("User data:", data);

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
            recentSearchedCities: [],
        }
        
        console.log("Processed user data:", userData);

        switch (type) {
            case "user.created":
                console.log("Creating user in database...");
                const createdUser = await User.create(userData);
                console.log("User created successfully:", createdUser);
                break;
            case "user.updated":
                console.log("Updating user in database...");
                const updatedUser = await User.findByIdAndUpdate(data.id, userData);
                console.log("User updated successfully:", updatedUser);
                break;
            case "user.deleted":
                console.log("Deleting user from database...");
                const deletedUser = await User.findByIdAndDelete(data.id);
                console.log("User deleted successfully:", deletedUser);
                break;
            default:
                console.log("Unknown webhook type:", type);
                break;
        }
        console.log("=== WEBHOOK PROCESSED SUCCESSFULLY ===");
        res.status(200).json({success: true, message: "Webhook received"});

    } catch (error){
        console.error("=== WEBHOOK ERROR ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(400).json({success: false, message: error.message});
    }
}


export default clerkWebhooks;
