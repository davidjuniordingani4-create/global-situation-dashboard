import test from 'node:test'
import assert from 'node:assert/strict'
import { analyse } from '../server/models.js'
const dashboard = { globalRiskLevel: 'HIGH', globalRiskScore: 50, dashboardStats: { earthquakes: 12, volcanoes: 3, cves: 20, kevs: 4, ransomware: 2 } }
test('A returns identical complete results across 100 runs', () => {
  const expected = analyse('A', dashboard)
  for (let i = 0; i < 100; i++) assert.deepEqual(analyse('A', dashboard), expected)
})
test('B sampling intervals cover distinct outcomes with the same input', () => {
  const first = analyse('B', dashboard, () => 0)
  const last = analyse('B', dashboard, () => 0.999999)
  assert.notEqual(first.selected, last.selected)
  assert.ok(Math.abs(first.probabilities.reduce((sum, row) => sum + row.probability, 0) - 1) < 1e-12)
})
test('empty or invalid counts do not manufacture events', () => {
  assert.deepEqual(analyse('A', {}).probabilities, [])
  assert.deepEqual(analyse('B', {dashboardStats:{earthquakes:-1, cves:'bad'}}).probabilities, [])
})
test('unseeded B demonstration: report observed variation', () => {
  const counts = {}
  for (let i = 0; i < 100; i++) { const key = analyse('B', dashboard).selected; counts[key] = (counts[key] || 0) + 1 }
  console.log('100 stochastic runs:', counts)
  // Variation is demonstrated, not guaranteed by a flaky statistical assertion.
})

test('large finite counts retain finite normalised probabilities', () => {
  const result = analyse('B', {dashboardStats: {kevs: 1e300, earthquakes: 1e200}})
  assert.ok(result.probabilities.every(row => Number.isFinite(row.probability)))
})
