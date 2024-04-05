const { body, validationResult } = require('express-validator');

// 아이디와 비밀번호를 검사하는 미들웨어
exports.validateCredentials = [
  // 아이디 유효성 검사 규칙
  body('id').notEmpty().withMessage('아이디를 입력하세요.'),
  body('id').isString().withMessage('아이디는 문자열이어야 합니다.'),
  body('id').matches(/^[a-zA-Z0-9]+$/).withMessage('아이디는 영문자와 숫자로만 이루어져야 합니다.'),
  body('id').isLength({ min: 4, max: 10 }).withMessage('아이디는 4자 이상 10자 이하여야 합니다.'),

  // 비밀번호 유효성 검사 규칙
  body('password').notEmpty().withMessage('비밀번호를 입력하세요.'),
  body('password').matches(/^[a-zA-Z0-9]+$/).withMessage('비밀번호는 영문자와 숫자로만 이루어져야 합니다.'),
  body('password').isLength({ min: 8, max: 16 }).withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.')
];

exports.getValidationResult = (req) => {
    return validationResult(req);
  };