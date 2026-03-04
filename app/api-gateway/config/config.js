import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  USER_SERVICE_HOST: "http://localhost:8002",
  USER_SERVICE_BASE_API: "/api/users",
};

export default envConfig;
