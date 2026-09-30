"""CPU-only adaptation of Tencent/R3-Skill infer.py (Apache-2.0).
Weights must already exist locally; runtime network access is disabled.
"""
import os
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
import numpy as np
import torch
from sentence_transformers import SentenceTransformer, CrossEncoder

ROOT = Path(__file__).resolve().parent
EMB_INSTR = 'Instruct: Given a user request, retrieve the agent skill that solves it.\nQuery: '
RR_INSTRUCT = 'Given a user request, retrieve the agent skill that solves it.'
torch.set_num_threads(2)
skills = [json.loads(line) for line in (ROOT / 'skills.jsonl').read_text().splitlines() if line.strip()]
emb = SentenceTransformer(str(ROOT / 'models/r3-embedding'), device='cpu', trust_remote_code=True, local_files_only=True)
emb.max_seq_length = 512
rr = CrossEncoder(str(ROOT / 'models/r3-reranker'), device='cpu', trust_remote_code=True, local_files_only=True)
rr.max_length = 512
doc_vectors = emb.encode([s['text'] for s in skills], normalize_embeddings=True, batch_size=1)

def route(question, dashboard):
    query = str(question)[:600] + '\nDashboard counts: ' + json.dumps(dashboard.get('dashboardStats', {}), sort_keys=True)[:1200]
    vector = emb.encode([EMB_INSTR + query], normalize_embeddings=True, batch_size=1)
    indices = np.argsort(-(vector @ doc_vectors.T)[0])[:3]
    scores = rr.predict([(query, skills[i]['text']) for i in indices], batch_size=1, prompt=RR_INSTRUCT, convert_to_numpy=True)
    scores = np.asarray(scores).reshape(-1)
    if len(scores) != len(indices):
        raise ValueError('Unexpected reranker output shape')
    ranked = [{'id': skills[int(indices[i])]['id'], 'score': float(scores[i])} for i in np.argsort(-scores)]
    return {'model': 'C', 'top_k': ranked, 'answer': '**Tencent R3 skill routing**\n\n' + '\n'.join(f"- {r['id']}: {r['score']:.4f}" for r in ranked) + '\n\nThese are skill relevance scores, not event probabilities. Routing selects an analysis skill; it does not execute it.'}

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/route':
            self.send_error(404)
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 1048576:
                raise ValueError('Invalid body size')
            data = json.loads(self.rfile.read(length))
            result = route(data.get('question', ''), data['dashboard'])
            status = 200
        except Exception as error:
            result, status = {'error': str(error)}, 500
        encoded = json.dumps(result).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

if __name__ == '__main__':
    print('Tencent R3 ready at http://127.0.0.1:5051', flush=True)
    HTTPServer(('127.0.0.1', 5051), Handler).serve_forever()
