import express from 'express'
import { analyse } from './models.js'
import { answerWithR3 } from './r3-ollama.js'

const app = express()
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'OK', models: ['A', 'B'], c: 'Requires R3 on port 5051 and Ollama llama3.1 on port 11434; this endpoint does not check their availability' }))
app.post('/api/assistant', async (req, res) => {
  const { model = 'A', dashboard, question = 'Summarize dashboard events' } = req.body
  if (!['A', 'B', 'C'].includes(model) || !dashboard || typeof dashboard !== 'object' || Array.isArray(dashboard)) {
    return res.status(400).json({ error: 'Supply model A/B/C and a dashboard object.' })
  }
  if (model !== 'C') return res.json(analyse(model, dashboard))
  if (typeof question !== 'string' || !question.trim() || question.length > 2000) {
    return res.status(400).json({ error: 'Supply a question between 1 and 2000 characters.' })
  }
  try {
    return res.json(await answerWithR3(question, dashboard))
  } catch (error) {
    return res.status(503).json({ error: error.message })
  }
})
app.listen(5050, '127.0.0.1', () => console.log('Local models: http://127.0.0.1:5050'))
