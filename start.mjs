import fs from 'node:fs'
import { spawn } from 'node:child_process'

let port = 3000

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8')
  const match = envContent.match(/^APP_PORT=(\d+)/m)
  if (match) {
    port = Number(match[1])
  }
}

if (process.env.APP_PORT) {
  port = Number(process.env.APP_PORT)
}

console.log(`Starting Nuxt preview on port ${port}...`)
const isWin = process.platform === 'win32'
const child = spawn(
  isWin ? 'npx.cmd' : 'npx',
  ['nuxt', 'preview', '--port', String(port)],
  { stdio: 'inherit' }
)

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
