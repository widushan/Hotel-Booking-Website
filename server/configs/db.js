import mongoose from "mongoose";


const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB');
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/Hotel-Book`)
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;