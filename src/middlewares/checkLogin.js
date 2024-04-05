const jwt = require("jsonwebtoken")

const checkLogin = (req, res, next) => {
    const { token } = req.headers
    const result = {
        "success" : false,
        "message" : "",
    }

    try {
         // 1. Token이 조작되지 않았는지
         jwt.verify(token, process.env.TOKEN_SECRET_KEY)

         // 2. 이 API를 사용할 권한이 되는지(지금은 필요 없음)

         next()

    } catch(e) {
        console.log(e)

        // 1. jwt must be provided" / 2. jwt expired / 3. invalid token
        if(e.message === "jwt must be provided") result.message = "로그인이 필요합니다."
        else if(e.message === "jwt expired") result.message = "세션이 만료되었습니다. 다시 로그인해주세요."
        else if(e.message === "invalid token") result.message = "정상적이지 않은 접근입니다."
        else result.message = e.message

        res.send(result)
    }
}

module.exports = checkLogin