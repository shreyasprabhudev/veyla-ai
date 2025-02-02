import { Model } from "./models";

export const engineConfig = {
  modelUrl: "https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_0-MLC/resolve/main/",
  wasmUrl: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/",
  cacheUrl: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/",
  useWebGPU: false,
  maxStorageBytes: 4 * 1024 * 1024 * 1024, // 4GB is sufficient for q4 quantized model
  modelLibCache: true,  // Enable caching for model libraries
  wasmCache: true,     // Enable caching for WebAssembly modules
  weightsCache: false, // Disable weights caching if causing issues
  required: [], 
  useIndexedDBCache: false,
  maxRetries: 5,       // More retries with shorter delays
  retryDelayMs: 3000,  // 3 second delay between retries
  chunkSize: 512 * 1024, // Use smaller chunks for reliability
};

export const chatOpts = {
  temperature: 0.7,
  max_gen_len: 2048,
  presence_penalty: 0,
  frequency_penalty: 0,
  repetition_penalty: 1.1,
  top_p: 0.9,
  system: "You are a helpful AI assistant.",
};
