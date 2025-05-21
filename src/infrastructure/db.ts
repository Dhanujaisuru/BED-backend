import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("No connection string found");
    }

    await mongoose.connect(connectionString);
    console.log("Connected to the Database");
  } catch (error) {
    console.error("Error connecting to the Database:", error);
    process.exit(1);
  }
};