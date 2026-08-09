const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("🔄 MongoDB connection starting...");
        console.log(
            "MONGO_URI exists:",
            Boolean(process.env.MONGO_URI)
        );

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing");
        }

        if (mongoose.connection.readyState === 1) {
            console.log("✅ MongoDB already connected");
            return mongoose.connection;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log("✅ MongoDB Connected");
        console.log("Host:", conn.connection.host);
        console.log("Database:", conn.connection.name);
        console.log("ReadyState:", conn.connection.readyState);

        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error");
        console.error(error);

        throw error;
    }
};

module.exports = connectDB;