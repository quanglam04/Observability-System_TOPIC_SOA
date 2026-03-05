import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

export default envConfig;
