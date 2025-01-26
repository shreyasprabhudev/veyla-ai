import { wrap } from 'comlink';
import { Message } from './store';
import { sensitiveDataDetector } from '@veyla-ai/extension/content';
import { InitProgressCallback } from '@mlc-ai/web-llm';

// Worker types
type WebGPUWorker = {
  initializeWebGPU: (progressCallback?: InitProgressCallback) => Promise<void>;
  generateResponse: (
    prompt: string, 
    context?: string,
    progressCallback?: (step: number, total: number) => void
  ) => Promise<string>;
  unloadModel: () => Promise<void>;
};

class ChatService {
  private worker: Worker | null = null;
  private webgpuApi: WebGPUWorker | null = null;
  private isLocal: boolean = false;
  private onProgress?: (progress: number) => void;

  async initialize(
    useLocal: boolean = false,
    onProgress?: (progress: number) => void
  ) {
    this.isLocal = useLocal;
    this.onProgress = onProgress;

    if (useLocal) {
      this.worker = new Worker(new URL('./webgpu-worker.ts', import.meta.url), {
        type: 'module',
      });
      this.webgpuApi = wrap<WebGPUWorker>(this.worker);
      
      await this.webgpuApi.initializeWebGPU((step: string, progress: number) => {
        console.log(`Loading model: ${step} (${Math.round(progress * 100)}%)`);
        onProgress?.(progress);
      });
    }
  }

  async processMessage(
    message: Message,
    context: string = '',
    onProgress?: (progress: number) => void
  ): Promise<Message> {
    // First check for sensitive information
    const hasSensitiveData = await sensitiveDataDetector.detect(message.content);
    
    if (hasSensitiveData && !this.isLocal) {
      // Switch to local processing if sensitive data detected
      await this.initialize(true, onProgress);
      this.isLocal = true;
    }

    let response: string;
    if (this.isLocal && this.webgpuApi) {
      response = await this.webgpuApi.generateResponse(
        message.content,
        context,
        (step, total) => {
          const progress = step / total;
          onProgress?.(progress);
        }
      );
    } else {
      // Use cloud API
      response = await this.callCloudAPI(message.content, context);
    }

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      model: this.isLocal ? 'local-llama' : 'cloud-gpt',
      processed: true,
    };
  }

  private async callCloudAPI(prompt: string, context: string): Promise<string> {
    // Implement your cloud API call here (ChatGPT/Claude)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
        model: 'gpt-3.5-turbo', // or 'claude-2'
      }),
    });

    const data = await response.json();
    return data.response;
  }

  async cleanup() {
    if (this.webgpuApi) {
      await this.webgpuApi.unloadModel();
    }
    if (this.worker) {
      this.worker.terminate();
    }
    this.worker = null;
    this.webgpuApi = null;
  }
}

export const chatService = new ChatService();
