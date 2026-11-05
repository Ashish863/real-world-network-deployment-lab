import mongoose from "mongoose";
const startServer=async function() {
    try {
        
        const connectionHost=await mongoose.connect(process.env.MONGODB_URI);
         console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Application startup failed:", error.message);
    process.exit(1);
    }

}
export {startServer}