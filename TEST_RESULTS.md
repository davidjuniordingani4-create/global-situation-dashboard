# Verification record — 30 September 2026

Environment: isolated Linux execution workspace, Node 24.19.0. These results are not evidence of execution on the student's Windows laptop.

| Check | Result |
|---|---|
| Read original README in full | Passed |
| Clone supplied repository | Passed; starting commit 6f2c3dd |
| npm install | Passed |
| npm run build | Passed; existing large-bundle warning |
| npm run test:models | 5 tests passed |
| Model A identical-input repeatability | Complete results matched across 100 runs |
| Model B variation | 100 random draws produced KEV 44, CVE 23, ransomware 17, volcano 9, earthquake 7 on first run; subsequent counts differ |
| Model B distribution boundaries | Injected draws 0 and 0.999999 select different categories; probabilities sum to one |
| Empty / malformed event counts | No events invented |
| npm run test:api | Passed: real local HTTP calls to A/B and invalid-input rejection |
| Model C absent-service behaviour | HTTP 503 with explicit setup message; no substitute model |
| Vite startup | Passed on loopback port 5173 |
| USGS earthquake endpoint | HTTP 200, 149572 bytes received |
| NASA EONET volcano endpoint | HTTP 200, 21671 bytes received |
| Browser display / live cyber feeds | Not verified: Chromium downloads returned unusable archives |
| Windows laptop execution | Pending student verification |
| Follow, star, fork relationship | Not performed or verified |
| GitHub push | Not performed |

The model tests use a clearly defined synthetic count fixture, not captured live incident data. Upstream feed time windows, simulated events and randomized marker locations limit interpretation. Neither A nor B estimates real-world disaster risk.

## Tencent Model C

Both official 0.6B weight sets downloaded successfully (approximately 2.3 GB each). Initial GPU-enabled PyTorch crashed on import; replacing it with PyTorch 2.14.1+cpu resolved the problem. With sentence-transformers 6.1.0 and transformers 5.17.0, the offline CPU adapter loaded both models and performed real embedding recall and cross-encoder reranking.

Question: “Which skill should review the earthquake activity?” with counts earthquake=12, volcano=3, KEV=4. Observed ranking: earthquake-review 1.1814, global-summary 0.9428, volcano-review -0.9146. These are model relevance scores, not probabilities. This verifies actual C inference in the execution workspace, not performance on the student's laptop.

Full Model C integration also passed: POST /api/assistant → local Node backend → http://127.0.0.1:5051/route → Tencent CPU inference → HTTP 200 and expected top skill. No cloud inference service was used.
