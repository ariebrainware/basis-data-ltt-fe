const fs = require('fs')
const https = require('https')
const next = require('next')

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const certPath = process.env.NEXT_SSL_CERT || './.certs/server.crt'
const keyPath = process.env.NEXT_SSL_KEY || './.certs/server.key'

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }

  const server = https.createServer(httpsOptions, (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> HTTPS server listening at https://localhost:${port}`)
  })
})
