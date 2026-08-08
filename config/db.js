const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("✅ MongoDB already connected");
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log("✅ MongoDB Connected");
        console.log("Host:", conn.connection.host);
        console.log("Database:", conn.connection.name);
        console.log("Ready State:", mongoose.connection.readyState);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:");
        console.error(error);
        throw error;
    }
};

module.exports = connectDB;