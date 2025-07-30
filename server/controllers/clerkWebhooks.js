
import User from "../models/User.js";
import { Webhook } from "svix";


const clerkWebhooks = async (req,res)=>{
    console.log("CLERK_WEBHOOK_SECRET:", process.env.CLERK_WEBHOOK_SECRET);
    try{
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };
        
        await whook.verify(JSON.stringify(req.body), headers)

        // Getting data from request body
        const { data, type } = req.body;

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
            recentSearchedCities: [],
        }

        switch (type) {
            case "user.created":
                await User.create(userData);
                break;
            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData);
                break;
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                break;
            default:
                break;
        }
        res.status(200).json({success: true, message: "Webhook received"});

    } catch (error){
        console.log(error.message);
        res.status(400).json({success: false, message: error.message});
    }


}


export default clerkWebhooks;
