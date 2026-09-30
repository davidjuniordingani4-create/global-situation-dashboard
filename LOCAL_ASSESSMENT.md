> **Model C updated:** This guide describes the original routing setup. Also follow MERGE_SETUP.md: C now requires local Ollama llama3.1 to generate its answer after routing. A/B are unchanged.

# Task 1 — Local Global Awareness Dashboard

Student: David Thulani Tinotenda Dingani — ST10358804

## What changed

The starter README was read in full. This fork actually uses React, Vite and an Express backend, rather than a standalone HTML file. The original README is preserved. Its Ollama setup is replaced for this assessment by two lightweight local models; Ollama is not required for A/B.

- Model A: a deterministic, hand-authored expert model. Each event category receives weight × ln(1 + count); the highest score wins, with a stable alphabetical tie-break.
- Model B: a probabilistic categorical model. It uses the same scores but samples from softmax(score / 2) using Node's local random number generator. This changes the selected review focus, not merely wording. It is not a trained predictor, and its selection probabilities are not real-world hazard probabilities.
- Model C: optional CPU-only Tencent R3 embedding + reranking integration. This selects relevant analysis skills; it is not a conversational language model. The adapter follows Tencent's infer.py and preserves its query prompts. Runtime uses downloaded local weights with Hugging Face offline mode enabled.

All inference is local. Public event feeds and initial dependency/model downloads still require internet; those are not cloud AI inference. Existing upstream simulated feeds remain simulated, and a successful empty feed cannot be distinguished from a failed feed using the starter's count-based health indicators.

## Windows setup for A and B

1. Install Node.js 22.12+ (or Node 24 LTS) and Git if missing.
2. Extract this project. Open the project folder in VS Code, then Terminal → New Terminal. Use Command Prompt if PowerShell blocks npm scripts.
3. Run:

```bat
npm ci
npm run test:models
npm run server
```

4. Keep that terminal open. Open a second terminal in the same folder:

```bat
npm run dev
```

5. Open http://127.0.0.1:5173 in your browser. Wait for feeds to load. Check earthquake, volcano and cybersecurity cards; feeds may be delayed, blocked by CORS or rate-limited.
6. In AI Dashboard Assistant select A and click Ask AI Assistant. The first response freezes dashboard input. Repeat several times: A should match exactly. Select B and repeat on that same snapshot: its selected category can differ (matching draws are also possible). Variation requires at least two non-empty categories.
7. Click “Use latest data on next run” only when you want a new snapshot. A/B provide structured count summaries; the question box is used by C.
8. Capture your own browser screenshots showing event data and the model results. No deployment command is needed.

Your 24 GB RAM is ample for A/B, which do not load neural-network weights. C is configured for CPU and two inference threads; its speed and RAM usage on your i5-6300U have not been measured.

## Optional Model C setup

Install Python 3.12. From the project folder in Command Prompt:

```bat
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu
.venv\Scripts\python -m pip install -r local-ai\requirements.txt
.venv\Scripts\hf download tencent/R3-embedding-0.6b --local-dir local-ai/models/r3-embedding
.venv\Scripts\hf download tencent/R3-rerank-0.6b --local-dir local-ai/models/r3-reranker
.venv\Scripts\python local-ai\r3_server.py
```

Keep this third terminal open and wait for “Tencent R3 ready”. The initial downloads may take time and several GB of disk space. In the dashboard select C and ask “Which skill should review the earthquake activity?”. Its request includes the question and frozen dashboard counts. If the local service is unavailable, the UI reports this explicitly instead of substituting A/B. Model weights and virtual environments are excluded from Git and the ZIP.

## Three-sentence deliverable note

Model A is a deterministic rule-based expert model that ranks dashboard event categories with fixed weights and stable tie-breaking, so identical inputs return identical results. Model B uses the same dashboard snapshot but samples a category from a softmax probability distribution, allowing repeated runs to select different review priorities. Both run entirely in the local Node.js backend without cloud AI APIs; Model C uses Tencent R3 embedding and reranking weights in an offline CPU service, with successful local inference recorded in TEST_RESULTS.md.

## GitHub checklist and submission

Your existing repository was cloned; account actions were not performed or verified. Check that it is genuinely a fork of The-ProfessorGG/global-situation-dashboard, follow The-ProfessorGG, and star the starter repository. The requested before-fork ordering cannot be retrospectively certified.

No changes have been pushed to GitHub. To update an existing clone, copy the changed source files from this ZIP into it (retain your .git folder), review `git diff`, then:

```bat
git switch -c assessment/local-models
git add .
git commit -m "Add local deterministic and probabilistic dashboard models"
git push -u origin assessment/local-models
```

Submit your repository branch link plus the note above and your own local-run evidence. Model C passed CPU inference in the test workspace. Verify it and live-feed display on your own machine before claiming personal local execution.

## Attribution

Original dashboard: https://github.com/The-ProfessorGG/global-situation-dashboard
Student fork: https://github.com/davidjuniordingani4-create/global-situation-dashboard
Tencent R3 architecture, prompts and integration pattern: https://github.com/Tencent/R3-Skill (Apache-2.0; license included in local-ai/TENCENT_LICENSE).
Model weights: https://huggingface.co/tencent/R3-embedding-0.6b and https://huggingface.co/tencent/R3-rerank-0.6b.
A/B implementation, tests, UI additions and local adapter were prepared with AI assistance. Review and understand the code before submitting and follow your course's disclosure requirements.
