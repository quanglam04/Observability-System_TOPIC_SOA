import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(uri);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      db_host: conn.connection.host,
      db_name: conn.connection.name
    });
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`, {
      errorDetail: error.message
    });
    process.exit(1);
  }
};

export default connectDB;