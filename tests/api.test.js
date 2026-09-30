import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'

test('local HTTP API handles A/B and invalid input', async () => {
  const server = spawn(process.execPath, ['server/index.js'])
  try {
    await new Promise((resolve, reject) => {
      server.stdout.once('data', resolve)
      server.once('error', reject)
      server.once('exit', code => reject(new Error(`Server exited: ${code}`)))
    })
    for (const model of ['A', 'B', 'invalid']) {
      const response = await fetch('http://127.0.0.1:5050/api/assistant', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({model, dashboard: {dashboardStats: {earthquakes: 12, volcanoes: 3, kevs: 4}}})
      })
      assert.equal(response.status, model === 'invalid' ? 400 : 200)
      const result = await response.json()
      if (model !== 'invalid') assert.ok(result.answer && result.selected)
    }
  } finally { server.kill() }
})
