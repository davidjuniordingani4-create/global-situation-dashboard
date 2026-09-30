import test from 'node:test'
import assert from 'node:assert/strict'
import { answerWithR3 } from '../server/r3-ollama.js'
const goodRoute = {top_k:[{id:'earthquake-review',score:1.2}]}
const response = (data, status=200) => new Response(JSON.stringify(data), {status})
test('R3 routes first and Ollama receives real skill text and dashboard', async () => {
  const calls=[]
  const answer=await answerWithR3('Seismic activity?', {earthquakes:[{magnitude:5}]}, async (url, options) => {
    calls.push({url, body:JSON.parse(options.body)})
    return response(calls.length===1 ? goodRoute : {message:{content:'Example test answer'}})
  })
  assert.equal(answer.skill,'earthquake-review')
  assert.equal(calls.length,2)
  assert.match(calls[1].body.messages[0].content,/Review the dashboard earthquake/)
  assert.match(calls[1].body.messages[1].content,/magnitude/)
  assert.equal(calls[1].body.options.temperature,0.8)
})
test('failed R3 stops before generation', async () => {
  let count=0
  await assert.rejects(answerWithR3('test',{},async()=>{count++;return response({error:'offline'},503)}),/Tencent R3 failed/)
  assert.equal(count,1)
})
test('unknown skill fails instead of silently substituting a model', async () => {
  await assert.rejects(answerWithR3('test',{},async()=>response({top_k:[{id:'unknown'}]})),/no recognised skill/)
})
test('Ollama error is reported accurately', async () => {
  let count=0
  await assert.rejects(answerWithR3('test',{},async()=>response(++count===1?goodRoute:{error:'model missing'},count===1?200:404)),/model missing/)
})
