// 그 날 로그인한 수를 히스토리로 저장 + 그 날 로그인한 수 초기화
// 매일 밤 자정에 실행되게끔 ( 패키지 상관 없 )
// 1분 후에 실행되도록 설정
setTimeout(async () => {
    console.log("1 minute has passed. Performing my task...");
    await redis.connect()
     // 어제 날짜를 가져옴 (YYYY-MM-DD 형식)
     const yesterday = new Date();
     yesterday.setDate(yesterday.getDate() - 1);
     console.log("Yesterday:", yesterday);

     const yesterdayString = yesterday.toISOString().slice(0, 10);
     console.log("Yesterday String:", yesterdayString);
 
     try {
         // 어제 로그인한 사용자 수를 가져옴
         const loginCount = await redis.zCard(`user_logins:${yesterdayString}`);
         console.log("Login count:", loginCount);
 
         // 어제 로그인 히스토리로 저장
         await redis.set(`login_history:${yesterdayString}`, loginCount);
 
        // 어제 로그인 히스토리를 가져옴
        const loginHistory = await redis.get(`login_history:${yesterdayString}`);
        console.log(`Login history for ${yesterdayString}:`, loginHistory);
     } catch (error) {
         console.error('Error saving login history:', error);
     }
},10 * 1000); // 10초를 밀리초로 변환하여 설정