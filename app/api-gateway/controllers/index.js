import logger from "../config/logger.js";
/**
 * Logic xử lý viết trong này
 */

class GatewayController {
  test = (req, res) => {
    logger.info("OK");
    res.json({
      message: "OsK",
    });
  };
}

const gatewayController = new GatewayController();

export default gatewayController;
