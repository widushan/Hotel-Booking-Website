import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "../server/configs/db.js";



connectDB();

const app = express()
app.use(cors()) // Enable Cross-Origin Resource Sharing

app.get('/', (req, res)=> res.send("API is workin g"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
