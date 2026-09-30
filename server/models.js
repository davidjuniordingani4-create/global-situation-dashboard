import { randomInt } from 'node:crypto'

// Educational expert system: explicit rules, not a trained forecasting model.
const domains = [
  ['earthquakes', 'Earthquakes', 2], ['volcanoes', 'Volcanoes', 3],
  ['cves', 'Vulnerabilities', 2], ['kevs', 'Known exploited vulnerabilities', 5],
  ['ransomware', 'Ransomware', 5], ['threatIntel', 'Threat intelligence', 2],
  ['breaches', 'Data breaches', 3], ['outages', 'Internet outages', 2],
  ['bgp', 'BGP events', 2], ['aircraft', 'Aircraft', 1], ['maritime', 'Maritime', 1]
]
export function candidates(dashboard) {
  return domains.map(([key, label, weight]) => {
    const raw = dashboard.dashboardStats?.[key]
    const count = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0
    return { key, label, count, score: weight * Math.log1p(count) }
  }).filter(row => row.count > 0)
}
export function analyse(model, dashboard, rng = () => randomInt(0, 2 ** 32) / 2 ** 32) {
  const rows = candidates(dashboard)
  const base = `Dashboard risk: ${dashboard.globalRiskLevel || 'not supplied'} (source dashboard score: ${dashboard.globalRiskScore ?? 'not supplied'}).`
  if (!rows.length) return { model, answer: `${base}\n\nNo positive event counts were supplied. Missing feeds do not establish that there are no events.`, probabilities: [] }
  const maximum = Math.max(...rows.map(row => row.score / 2))
  const weights = rows.map(row => Math.exp(row.score / 2 - maximum))
  const total = weights.reduce((a, b) => a + b, 0)
  const probabilities = rows.map((row, i) => ({ ...row, probability: weights[i] / total }))
  let selected
  if (model === 'A') selected = [...rows].sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))[0]
  else {
    let draw = rng()
    selected = probabilities.at(-1)
    for (const row of probabilities) { draw -= row.probability; if (draw < 0) { selected = row; break } }
  }
  return {
    model, selected: selected.key, probabilities,
    answer: `${base}\n\n**${model === 'A' ? 'Fixed-rule priority' : 'Sampled review focus'}: ${selected.label}** — ${selected.count} dashboard records.\n\n${model === 'A' ? 'Selected the largest weight × ln(1 + count), using the domain key to break ties.' : 'Drew a category from softmax(score / 2). Identical inputs may produce different selections; repeats can also match.'}\n\n${rows.map(row => `- ${row.label}: ${row.count}`).join('\n')}\n\nThese are illustrative review priorities, not predictions or calibrated event probabilities. Feed counts have different coverage and time windows. A/B provide structured summaries rather than open-ended question answering.`
  }
}
