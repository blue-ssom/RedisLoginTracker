// Node.js환경에서 cron(유닉스 계열 컴퓨터 운영 체제의 시간 기반 잡 스케줄러) 작업을 구현하기 위한 패키지
// 특정 시간에 주기적으로 실행되어야 하는 작업들을 관리
const cron = require('node-cron');

// 매일 한국 시간 자정에 실행되는 cron 작업 설정
// 0 0 * * * : 분 시간 매일 매월 매주
cron.schedule('0 0 * * *', async () => {
    // 어제 날짜를 가져옴 (YYYY-MM-DD 형식)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().slice(0, 10);

    try {
        // 어제 로그인 수를 가져옴
        const loginCount = await redis.zCard(`user_logins:${yesterdayString}`);
        
        // 어제 로그인 히스토리로 저장
        await redis.zAdd(`login_history:${yesterdayString}`, loginCount, Date.now());
    } catch (err) {
        console.error('Error:', err);
    }

}, {
    // timezone 옵션으로 작업이 실행될 시간대(도시)를 지정
    timezone: "Asia/Seoul"
});