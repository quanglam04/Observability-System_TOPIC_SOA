import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";

const app = express();

app.use("/api/users", router);

app.use((err, res, req, next) => {
  res.json({ message: "Không tồn tại đường dẫn" });
});
app.listen(envConfig.PORT, () => {
  console.log("ok");
});
