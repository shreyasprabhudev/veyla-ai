const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://huggingface.co/mlc-ai/mlc-chat-Llama-2-7b-chat-q4f32_1/resolve/main/Llama-2-7b-chat-q4f32_1.wasm';
const MODEL_PATH = path.join(__dirname, '../public/models');

if (!fs.existsSync(MODEL_PATH)) {
  fs.mkdirSync(MODEL_PATH, { recursive: true });
}

const file = fs.createWriteStream(path.join(MODEL_PATH, 'Llama-2-7b-chat-q4f32_1.wasm'));

console.log('Downloading model...');
https.get(MODEL_URL, (response) => {
  const total = parseInt(response.headers['content-length'], 10);
  let current = 0;

  response.on('data', (chunk) => {
    current += chunk.length;
    const progress = (current / total) * 100;
    process.stdout.write(`\rDownloading: ${progress.toFixed(2)}%`);
  });

  response.pipe(file);

  file.on('finish', () => {
    console.log('\nModel downloaded successfully!');
    file.close();
  });
}).on('error', (err) => {
  fs.unlink(path.join(MODEL_PATH, 'Llama-2-7b-chat-q4f32_1.wasm'));
  console.error('Error downloading model:', err.message);
});
