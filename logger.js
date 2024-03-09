const winston = require("winston");
const path = require("path");
const moment = require("moment"); // 轉換時間格是用

// 定義日誌文件路徑
const logDir = "logs";
const errorFIlePath = path.join(logDir, "errors.log"); // 會變成 ./logs/errors.log文件
const combinedFilePath = path.join(logDir, "combined.log"); // 會變成 ./logs/combined.log文件

// 配置 winston 日誌器
const logger = winston.createLogger({
  // 定義日誌級別
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().format("YYYY-MM-DD HH:mm:ss"), // 自定義時間戳格式
    }),
    winston.format.json(), // 設定日誌格式為 JSON
    winston.format.prettyPrint() // 以美觀的方式打印日誌信息
  ),

  // 定義多種輸出目標
  transports: [
    // 輸出日誌到控制台
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // 簡單格式化
      ),
    }),
    // 紀錄所有級別日誌到一個文件 (輸出日誌到檔案)
    new winston.transports.File({
      filename: combinedFilePath,
    }),

    // 紀錄 Warn 和 error 級別日誌到特定文件 (輸出日誌到檔案)
    new winston.transports.File({
      level: "warn",
      filename: errorFIlePath,
    }),
  ],
});

module.exports = logger;
