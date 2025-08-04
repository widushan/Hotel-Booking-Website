import "dotenv/config";
import mongoose from "mongoose";

console.log("🔍 Testing server configuration...\n");

// Check environment variables
const requiredVars = ['MONGODB_URI', 'CLERK_SECRET_KEY'];
let missingVars = [];

for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
        missingVars.push(envVar);
    } else {
        console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***SET***' : process.env[envVar]}`);
    }
}

if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.error("Please create a .env file with the required variables.");
    process.exit(1);
}

// Test database connection
console.log("\n🔗 Testing database connection...");

const testConnection = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        };

        await mongoose.connect(`${process.env.MONGODB_URI}/Hotel-Book`, options);
        console.log("✅ Database connection successful!");
        
        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections in database`);
        
        await mongoose.disconnect();
        console.log("✅ Database test completed successfully!");
        
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

testConnection(); 