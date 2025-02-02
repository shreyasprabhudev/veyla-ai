import { CreateMLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";

export type ProgressCallback = (text: string) => void;

const engineConfig = {
  initProgressCallback: (report: InitProgressCallback) => {
    console.log("Loading step:", report.text);
  },
  appConfig: {
    useIndexedDBCache: true,
    model_list: [
      {
        model_url: "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1/resolve/main/",
        local_id: "Llama-2-7b-chat-hf-q4f32_1",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat/Llama-2-7b-chat-q4f32_1.wasm",
        required_features: ["shader-f16"],
        model_format: "paf",
      }
    ]
  }
};

const chatOpts = {
  temperature: 0.7,
  repetition_penalty: 1.1,
};

let chatWorker: Awaited<ReturnType<typeof CreateMLCEngine>> | null = null;

export async function initializeChat(progressCallback: ProgressCallback) {
  if (chatWorker) {
    return chatWorker;
  }

  // Configure progress callback
  engineConfig.initProgressCallback = (report: InitProgressCallback) => {
    console.log("Loading step:", report.text);
    progressCallback(report.text);
  };

  // Attempt WebGPU, fallback to WebGL
  try {
    await tf.setBackend("webgpu");
    await tf.ready();
    console.log("Using WebGPU backend");
  } catch {
    console.log("WebGPU not available, falling back to WebGL");
    await tf.setBackend("webgl");
    await tf.ready();
  }

  chatWorker = await CreateMLCEngine(
    "Llama-2-7b-chat-hf-q4f32_1",
    engineConfig,
    chatOpts
  );

  return chatWorker;
}

export async function generateResponse(messages: { role: string; content: string }[]) {
  if (!chatWorker) {
    throw new Error("Chat worker not initialized");
  }

  const replyStream = await chatWorker.chat.completions.create({
    messages,
    temperature: 0.7,
    stream: true,
    stream_options: { include_usage: true },
  });

  return replyStream;
}

export async function unloadChat() {
  if (chatWorker) {
    await chatWorker.unload();
    chatWorker = null;
  }
}

export async function resetChat() {
  if (chatWorker) {
    await chatWorker.resetChat();
  }
}
