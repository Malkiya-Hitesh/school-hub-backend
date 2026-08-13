const mongoose = require("mongoose");

// Serverless-friendly cached connection + retries
let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!cached.promise) {
    const connectWithRetry = async (retries = 3, delayMs = 5000) => {
      let lastErr;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`🔄 MongoDB: connecting (attempt ${attempt}/${retries})`);

          const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000, // wait up to 30s for server selection
            socketTimeoutMS: 45000,
            family: 4, // IPv4
            // useUnifiedTopology: true is default in mongoose v6+
          });

          console.log("✅ MongoDB Connected");
          console.log("Host:", conn.connection.host);
          console.log("Database:", conn.connection.name);
          return conn;
        } catch (err) {
          lastErr = err;
          console.error(`MongoDB connect attempt ${attempt} failed:`, err.message || err);
          if (attempt < retries) {
            const wait = delayMs * attempt; // exponential-ish backoff
            console.log(`Waiting ${wait}ms before next attempt...`);
            await new Promise((r) => setTimeout(r, wait));
          }
        }
      }

      throw lastErr;
    };

    cached.promise = connectWithRetry();
  }

  const m = await cached.promise;
  cached.conn = m;
  return cached.conn;
};

module.exports = connectDB;