import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const testConnection = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // check companies count
    const companies = await mongoose.connection.db.collection("companies").find().toArray();
    console.log(`Found ${companies.length} companies`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

testConnection();
