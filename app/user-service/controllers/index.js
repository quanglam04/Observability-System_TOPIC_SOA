import envConfig from "../config/config.js";
import logger from "../config/logger.js";
import axios from "axios";
import User from "../model/user.js";
import { dbQueryCounter, dbQueryDuration } from "../config/metrics.js";
/**
 * Logic xử lý viết trong này
 */


class UserController {
  test = (req, res) => {
    logger.info("OK");
    res.json({
      message: "OsK",
    });
  };

  async register(req, res) {
    try {
      const { email, username, password} = req.body;

      // Hàm đếm bắt đầu thực hiện query DB đến lúc đến thúc, và tăng biến db_count lên 1
      // các hàm có query đều thực hiện logic tương tự
      const endFindTimer = dbQueryDuration.startTimer({ operation: "findOne" });
      const isExist = await User.findOne({ email }); // kẹp giữa để đếm time
      endFindTimer();
      dbQueryCounter.inc({ operation: "findOne", status: "success" });

      if (isExist) {
        logger.error(`Email ${email} đã tồn tại`);
        return res.status(400).json({ message: "Email này đã được đăng ký!" });
      }

      const endCreateTimer = dbQueryDuration.startTimer({ operation: "create" });
      const newUser = await User.create({ email, username, password });
      endCreateTimer();
      dbQueryCounter.inc({ operation: "create", status: "success" });

      // --- CHẠY NGẦM (FIRE AND FORGET) ---
      // Không dùng await, nối trực tiếp .then() và .catch() để xử lý kết quả ở background
      axios.post(
        `${envConfig.NOTIFICATION_SERVICE_HOST}${envConfig.NOTIFICATION_SERVICE_BASE_API}/send-email`,
        {
          email: email,
          subject: "Xác nhận tài khoản",
          message: `Chào ${username}, bạn đã đăng ký thành công.`,
        }
      )
      .then(() => {
        logger.info(`Đã yêu cầu Notification Service gửi email cho: ${email}`);
      })
      .catch((notifyError) => {
        logger.error(`Lỗi gọi Notification Service: ${notifyError.message}`);
      });

      // Trả về kết quả cho gateway
      res.status(201).json({
        message: "Đăng ký thành công",
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
        },
      });
    } catch (error) {
      dbQueryCounter.inc({ operation: "db_error", status: "error" });

      logger.error(`Lỗi đăng ký: ${error.message}`);
      res.status(500).json({ message: "Lỗi hệ thống khi đăng ký" });
    }
  }

  async login(req, res) {
    try {
      const {email, password} = req.body

      const endFindTimer = dbQueryDuration.startTimer({ operation: "findOne" });
      const user = await User.findOne({ email });
      endFindTimer();
      dbQueryCounter.inc({ operation: "findOne", status: "success" });

      if (!user) {
        logger.warn(`Đăng nhập thất bại: Email ${email} không tồn tại`);
        return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      if (user.password !== password) {
        logger.warn(`Đăng nhập thất bại: Sai mật khẩu cho email ${email}`);
        return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
      }

      res.status(200).json({
        message: "Đăng nhập thành công!",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
      logger.info(`Đăng nhập thành công: ${user.username}`)
    } catch (error) {
      dbQueryCounter.inc({ operation: "db_error", status: "error" });

      logger.error(`Đăng nhập thất bại: ${error.message}`);
      res.status(500).json({ error: "Lỗi hệ thống khi đăng nhập" });
    }
  }

  async profile (req, res){
    try {
      const userId = req.params.id;

      const endFindByIdTimer = dbQueryDuration.startTimer({ operation: "findById" });
      const user = await User.findById(userId).lean();
      endFindByIdTimer();
      dbQueryCounter.inc({ operation: "findById", status: "success" });

      if(!user){
        logger.warn(`Không tìm thấy người dùng với Id: ${userId}`);
        return res.status(404).json({ message: "Người dùng không tồn tại!" });
      }

      const {password, ...userProfile} = user;

      logger.info(`Lấy thông tin người dùng thành công cho Id: ${userId}`);
      res.status(200).json({
        status: 200,
        message: "Lấy thông tin thành công",
        data: userProfile
      })
    } catch (error) {
      dbQueryCounter.inc({ operation: "db_error", status: "error" });
      
      logger.error(`Lấy thông tin thất bại: ${error.message}`);
      res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin" });
    }
  }
}

const userController = new UserController();

export default userController;
