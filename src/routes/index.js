const router = require("express").Router() // express 안에 있는 Router만 import
// const redis = require("../../database/db");
const redis = require("redis").createClient();
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
    }
    console.log("아이디:",id)
    console.log("비밀번호:",password)

    try {
        // Redis에서 사용자의 아이디와 비밀번호를 가져옴
        await redis.connect()
        const userPassword = await redis.hGet('users', id);

        // 사용자의 비밀번호가 일치하는지 확인
        if (userPassword !== password) {
            throw new Error("회원 정보가 존재하지 않아용");
        }

        // 오늘 날짜를 가져옴 (YYYY-MM-DD 형식)
        // new Date().toISOString()은 현재 날짜와 시간을 ISO 8601 형식으로 변환하는 JavaScript의 내장 함수
        // slice(0, 10)을 사용하여 문자열의 처음부터 10번째 문자까지를 가져옴

        console.log(Date.now())


        await redis.zAdd('today', {
            score : Date.now(), 
            value : id
        });

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

// 오늘 하루동안 로그인한 회원 수 조회 API 엔드포인트
// Today 수 + 최근 접속자 목록(최신순 5명까지) 출력 + Total 수

// 그 날 로그인한 수를 히스토리로 저장 + 그 날 로그인한 수 초기화
// 매일 밤 자정에 실행되게끔 ( 패키지 상관 없 )


module.exports = router