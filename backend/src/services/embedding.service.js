import { pipeline } from '@xenova/transformers';

let embedder;

// โหลด model ครั้งเดียว
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embedder;
}

export async function getLocalEmbedding(text) {
  const model = await loadModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}