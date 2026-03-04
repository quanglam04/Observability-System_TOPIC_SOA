import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";

const app = express();

app.use(router);

app.listen(envConfig.PORT, () => {
  console.log("ok");
});
