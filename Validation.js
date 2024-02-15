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

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
