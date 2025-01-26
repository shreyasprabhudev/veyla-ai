import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import { ChatModule, InitProgressCallback } from '@mlc-ai/web-llm';

let chatModule: ChatModule | null = null;

export async function initializeWebGPU(
  progressCallback?: InitProgressCallback
) {
  // First try WebGPU
  try {
    await tf.setBackend('webgpu');
    await tf.ready();
    console.log('Using WebGPU backend');
  } catch (e) {
    // Fallback to WebGL
    console.log('WebGPU not available, falling back to WebGL');
    await tf.setBackend('webgl');
    await tf.ready();
  }
  
  if (!chatModule) {
    chatModule = new ChatModule();
    
    // Configure the chat module
    await chatModule.reload("Llama-2-7b-chat-q4f32_1", progressCallback);
    
    // Set chat configurations
    await chatModule.setConversation({
      systemPrompt: "You are a helpful AI assistant focused on privacy and security.",
      temperature: 0.7,
      maxTokens: 2048,
    });
  }
  
  return chatModule;
}

export async function generateResponse(
  prompt: string, 
  context: string = '',
  progressCallback?: (step: number, total: number) => void
) {
  if (!chatModule) {
    throw new Error('Chat module not initialized');
  }

  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
  
  let response = '';
  for await (const chunk of chatModule.generate(fullPrompt)) {
    response += chunk.text;
    progressCallback?.(chunk.progress, chunk.totalSteps);
  }

  return response;
}

export async function unloadModel() {
  if (chatModule) {
    await chatModule.unload();
    chatModule = null;
  }
}
