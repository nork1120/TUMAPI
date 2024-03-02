const Joi = require("joi");

// 如果有人要註冊我們系統的話，就要先通過這個 registerValidation
const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    real_name: Joi.string().required(),
    department_id: Joi.number().integer().required(),
    phone: Joi.string().required(),
    email: Joi.string().required(),
    student_no: [Joi.string().optional(), Joi.allow(null)],
  });

  return schema.validate(data);
};

// 登入 驗證
const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
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
