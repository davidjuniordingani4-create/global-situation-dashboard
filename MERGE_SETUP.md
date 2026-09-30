# R3 + Ollama update

The supplied backend's R3-to-Ollama workflow is now merged into Model C. Models A/B remain the existing deterministic rules and probabilistic category sampler. They still produce count summaries, not individual answers to ICE 4's six questions.

Changed files: server/index.js, new server/r3-ollama.js, src/App.jsx, tests/r3-ollama.test.js. The HTML entry point did not need changes.

Instead of spawning Python with a hard-coded C:\Dev path for every question, Model C calls this project's existing local R3 service on 127.0.0.1:5051. The service keeps the models loaded. The selected skill's full instructions, question and dashboard snapshot are then sent to local Ollama at 127.0.0.1:11434, using llama3.1 and temperature 0.8. The reply includes skill and score metadata. Failures are reported explicitly; no silent fallback is used.

## Run on your Windows laptop

Extract this updated ZIP into a NEW folder. Keep your previous project as a backup. Open the new global-situation-dashboard folder in VS Code.

In each PowerShell terminal, first run this temporary PATH fix:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

Terminal 1:

```powershell
npm.cmd ci
npm.cmd run server
```

Terminal 2:

```powershell
npm.cmd run dev
```

Open the local address displayed by Vite. A/B require only these two terminals.

For C, complete the Python/weight setup in LOCAL_ASSESSMENT.md and run in terminal 3:

```powershell
.\.venv\Scripts\python.exe local-ai\r3_server.py
```

If your old project already has local-ai/models and .venv, reuse the downloaded models by copying local-ai/models into this new project. Create a new virtual environment here using the guide; virtual environments should not be moved.

Install Ollama if needed, open its desktop app, and in a separate terminal run:

```powershell
ollama pull llama3.1
ollama list
```

If Ollama reports it cannot connect, start `ollama serve` in a separate terminal. If port 11434 is already in use by Ollama, its server is already running. Select Model C in the dashboard and ask your question. R3 plus an 8B language model can take substantial time on your i5 CPU; requests allow up to three minutes for routing and five minutes for generation. Weight downloads require internet; inference uses only local endpoints.

## Verification of this merge

Nine unit tests passed: five A/B tests and four integration-logic tests. The four new tests use mocked R3/Ollama replies and verify skill instructions, dashboard forwarding and error handling. They do not prove real Ollama inference works. No real R3/Ollama run was performed for this merge; TEST_RESULTS.md contains older evidence for R3 routing alone. Complete the live Model C check on your laptop before recording your assessment.

To run the added tests:

```powershell
node --test tests/r3-ollama.test.js
```

Model C now generates answers probabilistically. It must acknowledge absent trend or regional evidence rather than invent it, but language-model output still needs checking against the dashboard.

Build verification: npm run build passed (large-bundle warning only); npm run test:api passed. Browser display and real combined R3/Ollama generation remain unverified for this merge.
