const Joi = require("joi");

// 如果有人要註冊我們系統的話，就要先通過這個 registerValidation
const registerValidation = (data, departmentCategory) => {
  // 設定 student_no 是否必填
  const studentNoRule =
    departmentCategory === 2
      ? Joi.string()
          .pattern(/^\d{12}$/)
          .required()
          .messages({
            "string.pattern.base": "學號必須為12位數字",
            "string.empty": "學號不能為空。",
            "any.required": "學號是必填欄位！",
          })
      : Joi.string().optional().allow(null);

  const schema = Joi.object({
    username: Joi.string().required().messages({
      "string.empty": "帳號不能為空。",
      "any.required": "帳號是必填欄位!",
    }),
    password: Joi.string().required().messages({
      "string.empty": "密碼不能為空。",
      "any.required": "密碼是必填欄位!",
    }),
    real_name: Joi.string()
      .required()
      .custom((value, helpers) => {
        // 使用正則表達式檢查是否為純中文
        const isChinese = /^[\u4e00-\u9fa5]+$/.test(value);
        if (isChinese && value.length > 5) {
          return helpers.message("中文姓名不得超過5個字");
        }

        // 使用正則表達式檢查是否為純英文
        const isEnglish = /^[A-Za-z\s]+$/.test(value);
        if (isEnglish && value.replace(/\s+/g, "").length > 10) {
          return helpers.message("英文姓名不得超過10個字（不計空格）");
        }

        // 如果既不是純中文也不是純英文，或者長度合適，則返回原始值
        return value;
      })
      .messages({
        "string.empty": "真實姓名不能為空。",
        "any.required": "真實姓名是必填欄位!",
      }),
    department_id: Joi.number().integer().required(),
    phone: Joi.string()
      .required()
      .pattern(/^09\d{8}$/)
      .messages({
        "string.pattern.base": "電話號碼必須是以09開頭且為10位數字",
        "string.empty": "電話號碼不能為空。",
        "any.required": "電話號碼是必填欄位!",
      }),
    email: Joi.string().email().required().messages({
      "string.email": "請輸入有效的電子郵件地址。",
      "string.empty": "信箱不能為空。",
      "any.required": "信箱是必填欄位!",
    }),
    student_no: studentNoRule,
  });

  const validation = schema.validate(data, { abortEarly: false });

  // 檢查帳號與密碼是否一致
  if (!validation.error && data.username === data.password) {
    // 如果帳號與密碼一致，手動添加一個錯誤
    validation.error = {
      details: [{ message: "帳號與密碼不能相同。" }],
    };
  }

  return validation;
};

// 登入 驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "string.empty": "帳號不能為空。",
      "any.required": "帳號是必填欄位!",
    }),
    password: Joi.string().required().messages({
      "string.empty": "密碼不能為空。",
      "any.required": "密碼是必填欄位!",
    }),
  });

  return schema.validate(data);
};

// 更改 驗證
const editUserValidation = (data) => {
  const schema = Joi.object({
    real_name: Joi.string().required().messages({
      "string.base": "真實姓名必須是一串文字。",
      "string.empty": "真實姓名不能為空。",
      "any.required": "真實姓名是必填欄位!",
    }),
    phone: Joi.string()
      .pattern(/^09\d{8}$/)
      .required()
      .messages({
        "string.pattern.base": "電話號碼必須是以09開頭且為10位數字",
        "string.empty": "電話號碼不能為空。",
        "any.required": "電話號碼是必填欄位!",
      }), // 限定為09開頭並固定為10個數字號碼
    email: Joi.string().email().required().messages({
      "string.email": "請輸入有效的電子郵件地址。",
      "string.empty": "電子郵件地址不能為空。",
      "any.required": "電子郵件地址是必填欄位!",
    }), // 限定為信箱格式
  }).unknown(); // 允許存在未知欄位

  return schema.validate(data, { abortEarly: false });
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.editUserValidation = editUserValidation;
