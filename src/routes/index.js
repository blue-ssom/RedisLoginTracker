const router = require("express").Router() // express 안에 있는 Router만 import
const redis = require("redis").createClient()
const {  validateCredentials, getValidationResult } = require('../middlewares/validator');

// 사용자 로그인 API 엔드포인트
router.post("/", validateCredentials, async(req,res) => {
    // 검증 결과 가져오기
    const errors = getValidationResult(req);

    // 검증 결과 확인
    if (!errors.isEmpty()) {
        // 에러 메시지 출력
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id, password } = req.body
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        // Redis에서 사용자의 아이디와 비밀번호를 가져옴
        await redis.connect()
        const userPassword = await redis.hGet('users', id);
        console.log(userPassword); // 사용자의 비밀번호를 콘솔에 출력하여 확인


        // 사용자의 비밀번호가 일치하는지 확인
        if (userPassword !== password) {
            throw new Error("회원 정보가 존재하지 않아용");
        }

        // 사용자가 존재하고 비밀번호가 일치하는 경우 로그인 성공 처리
        result.success = true;
        result.message = "로그인 성공";
    } catch(err){
        result.message = err.message
        console.log(err.message)
    } finally{
        res.send(result)
    }
})

module.exports = router