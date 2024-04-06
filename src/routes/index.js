const router = require("express").Router() // express 안에 있는 Router만 import
const redis = require("redis").createClient();
const {  validateCredentials, getValidationResult } = require('../middlewares/validator');

// 사용자 로그인 API 엔드포인트
router.post("/", validateCredentials, async(req,res) => {
    // 검증 결과 가져오기
    const errors = getValidationResult(req);

    // 검증 결과 확인
    if (!errors.isEmpty()) {
        // 에러 메시지 출력
        return res.status(400).json({ 
            success: false, 
            message: errors.array()[0].msg 
        });
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
        const today = new Date().toISOString().slice(0, 10);
        const key = `user_logins:${today}`;

        await redis.zAdd(key, {
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
router.post("/stats", async(req,res) => {
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        await redis.connect()

        const today = new Date().toISOString().slice(0, 10);
        console.log(today)
        console.log(new Date());


        const key = `user_logins:${today}`;
        console.log(key)

        // 오늘 로그인한 사용자 수를 가져오기
        const todayLoginCount = await redis.zCard(`user_logins:${today}`);

        // 모든 날짜에 대한 키 패턴 정의
        const keyPattern = 'user_logins:*';

        // 키 패턴을 사용하여 모든 날짜의 키를 가져옴
        const keys = await redis.keys(keyPattern);
        console.log('Matching keys:', keys);

        // 날짜를 추출하여 정렬
        const sortedKeys = keys.sort((a, b) => {
            const dateA = new Date(a.split(':')[1]);
            const dateB = new Date(b.split(':')[1]);
            return dateA - dateB;
        });
        sortedKeys.reverse();
        console.log('Matching keys after sorting:', sortedKeys);
        
        // 모든 날짜의 로그인 사용자 수
        let totalLoginsCount = 0;
        for (const key of keys) {
            const count = await redis.zCard(key);
            totalLoginsCount += count;
        }

        // 최근 로그인 사용자를 저장할 리스트 초기화
        const recentLoginUsers = [];

        // 각 키에 대해 멤버들을 가져와서 최근 로그인한 사용자를 리스트에 추가
        for (const key of sortedKeys) {
            console.log(`Key: ${key}`);
            const members = await redis.zRange(key, 0, -1, 'WITHSCORES');
            members.reverse()
            console.log(`Members: ${members}`);
            // members 배열에서 홀수 인덱스에는 사용자 이름이 저장되어 있음
            for (let i = 0; i < members.length; i ++) {
                const user = members[i];
                recentLoginUsers.push(user);
            }
        }
        console.log(recentLoginUsers);

       // 중복 제거
        const uniqueUsers = Array.from(new Set(recentLoginUsers));

        // 순서를 유지하면서 최대 5명의 사용자 선택
        const top5Users = uniqueUsers.slice(0, 5);
        console.log('Top 5 users:', top5Users);

        result.success = 'true';
        result.message = '굿'
        result.data = {
            'today': todayLoginCount,
            'total': totalLoginsCount,
            '최근 접속자 목록': top5Users,
        };

    } catch (err) {
        result.message = err.message
        console.log(err.message)
    } finally{
        res.send(result)
    }
})

module.exports = router