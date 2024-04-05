const redis = require("redis").createClient()

redis.connect()
// Redis 클라이언트 오류 이벤트 처리
redis.on("error", (err) => {
  console.error("Redis 오류:", err);
});

module.exports = redis;