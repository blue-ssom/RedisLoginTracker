// express.js import하기
const express = require("express")

const app = express()
const port = 8000

app.use(express.json())

const LoginApi =  require("./src/routes/index")
app.use("/login", LoginApi)

// Web Server 실행 코드
app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`)
})