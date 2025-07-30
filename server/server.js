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


connectDB();

connectCloudinary();

const app = express()
app.use(cors()) // Enable Cross-Origin Resource Sharing

//Middleware
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk Webhooks
app.use('/api/clerk', clerkWebhooks)

app.get('/', (req, res)=> res.send("API is working"))
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
