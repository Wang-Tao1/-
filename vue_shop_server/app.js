const express = require('express')
const compression = require('compression')
const https = require('https')
const fs = require('fs')
const app = express()

// const options = {
//     cert: fs.readFileSync('./full_chain.pem'),
//     key: fs.readFileSync('./private.key')
//   }

// 一定要把这一行代码，写到 静态资源托管之前
app.use(compression())
app.use(express.static('./dist/dist'))

app.listen(3002, () => {
  console.log('server running 2')
})

// https.createServer(options, app).listen(443)

