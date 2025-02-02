"use client";

import { useState, useEffect } from "react";
import { MLCEngine } from "@mlc-ai/web-llm";
import * as tf from "@tensorflow/tfjs";
import { UserInput } from "@/app/features/chat/components/UserInput";
import { useChatStore } from "@/app/features/chat/store";
import { MessageList } from "@/app/features/chat/components/MessageList";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { engineConfig, chatOpts } from "@/app/features/chat/config";
import { Navigation } from "@/components/ui/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { ModelsDropdown } from "@/app/features/chat/components/ModelsDropdown";

// Dev flag for detailed logging
const DEV_MODE = false;

// Initialize chat instance
let chatInstance: MLCEngine | null = null;

export default function DashboardPage() {
  const { userInput, setUserInput, chatHistory, setChatHistory, selectedModel, isGenerating, setIsGenerating } = useChatStore();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const initProgressCallback = (report: { progress: number; text?: string }) => {
    if (DEV_MODE) {
      console.log("Progress:", report);
    }
    setLoadingProgress(report.progress);
    setLoadingText(`Loading model: ${Math.round(report.progress * 100)}%`);
  };

  useEffect(() => {
    if (isInitializing) {
      setShowLoadingModal(true);
    } else {
      // Add a small delay before hiding to allow the fade-out animation
      const timer = setTimeout(() => {
        setShowLoadingModal(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInitializing]);

  const cancelLoading = async () => {
    setIsCancelled(true);
    setIsInitializing(false);
    setLoadingProgress(0);
    setLoadingText("");
    if (chatInstance) {
      try {
        // Attempt to abort any ongoing operations
        await chatInstance.unload();
      } catch (e) {
        console.error("Error during cancellation:", e);
      }
    }
  };

  async function loadEngine() {
    if (isInitializing || isModelLoaded) return;
    setIsInitializing(true);
    setIsCancelled(false);
    setLoadingProgress(0);
    setLoadingText("Initializing...");
    setError(null);

    // Check available storage
    try {
      const storage = await navigator.storage.estimate();
      if (DEV_MODE) {
        console.log("Storage estimate:", {
          usage: `${Math.round(storage.usage / 1024 / 1024)}MB`,
          quota: `${Math.round(storage.quota / 1024 / 1024)}MB`,
          remaining: `${Math.round((storage.quota - storage.usage) / 1024 / 1024)}MB`
        });
      }
      
      if (storage.usage && storage.quota && (storage.quota - storage.usage) < 500 * 1024 * 1024) {
        console.warn("Low storage space remaining. This may cause model loading issues.");
      }
    } catch (e) {
      console.warn("Could not check storage quota:", e);
    }

    if (DEV_MODE) {
      const gpuInfo = await getGPUTier();
      console.log("Loading engine for model:", selectedModel, {
        gpuInfo,
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency,
      });
    }

    try {
      // Initialize WebGL backend with better error handling
      try {
        // First try to get WebGL context to check support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          throw new Error('WebGL not supported in this browser');
        }

        // Initialize TensorFlow.js backend
        await tf.setBackend("webgl");
        await tf.ready();
        
        // Only try to get WebGL info if we successfully initialized
        if (DEV_MODE) {
          const backend = tf.backend() as any;
          if (backend?.gl) {
            console.log("WebGL Info:", {
              version: backend.gl.getParameter(backend.gl.VERSION),
              vendor: backend.gl.getParameter(backend.gl.VENDOR),
              renderer: backend.gl.getParameter(backend.gl.RENDERER),
            });
          }
        }
      } catch (e) {
        console.error("WebGL initialization failed:", e);
        throw new Error(`WebGL initialization failed. This could be due to browser compatibility or system resources. Try using Chrome or Edge for better compatibility. Details: ${e.message}`);
      }

      // Create chat instance if it doesn't exist
      if (!chatInstance) {
        chatInstance = new MLCEngine({
          ...engineConfig,
          initProgressCallback: (progress) => {
            if (isCancelled) return;
            
            // Handle progress errors
            if (progress.text?.toLowerCase().includes("error") || 
                progress.text?.toLowerCase().includes("failed")) {
              console.error("Progress error:", progress);
              throw new Error(progress.text);
            }

            // Reserve the last 5% for initialization
            const rawProgress = progress.progress || 0;
            const adjustedProgress = Math.min(rawProgress, 0.95);
            setLoadingProgress(adjustedProgress);
            
            if (DEV_MODE) {
              // Detailed logging for dev mode
              const text = progress.text?.toLowerCase() || "";
              const progressPercent = Math.round(adjustedProgress * 100);
              
              if (text.includes("download")) {
                const stage = text.includes("wasm") ? "WASM Module" :
                            text.includes("lib") ? "Model Library" :
                            text.includes("param") ? "Model Parameters" : "Files";
                
                setLoadingText(`Downloading ${stage} (${progressPercent}%)`);
                console.log(`Downloading ${stage}:`, {
                  progress: `${progressPercent}%`,
                  timeElapsed: `${progress.timeElapsed}ms`,
                  text: progress.text
                });
              } else if (text.includes("initialize")) {
                setLoadingText(`Initializing (${progressPercent}%)`);
              } else {
                setLoadingText(progress.text || "Loading...");
              }
            } else {
              // Simple messages for production
              const phase = rawProgress >= 0.99 ? "Finalizing" : "Loading";
              setLoadingText(`${phase}...`);
            }
          },
          shouldAbort: () => isCancelled,
        });
      }

      let retryCount = 0;
      const maxRetries = engineConfig.maxRetries;

      while (retryCount < maxRetries) {
        try {
          setLoadingText(DEV_MODE ? `Loading model (attempt ${retryCount + 1}/${maxRetries})...` : 'Loading model...');
          await chatInstance.reload(selectedModel);
          break;
        } catch (e) {
          retryCount++;
          const errorDetails = {
            message: e.message,
            name: e.name,
            stack: e.stack,
            attempt: retryCount,
            model: selectedModel,
          };
          console.error(`Model load attempt ${retryCount}/${maxRetries} failed:`, errorDetails);
          
          if (retryCount === maxRetries) {
            // Provide specific error messages for common issues
            if (e.message?.includes('Device lost') || e.message?.includes('popErrorScope')) {
              throw new Error(`GPU context lost. This usually happens when the system runs out of GPU memory. Try closing other tabs or restarting your browser. Details: ${e.message}`);
            } else if (e.message?.includes('NetworkError') || e.message?.includes('Failed to fetch')) {
              throw new Error(`Network error while downloading model files. Check your internet connection and try again. Details: ${e.message}`);
            } else if (e.message?.includes('QuotaExceededError')) {
              throw new Error(`Browser storage quota exceeded. Try clearing your browser cache or freeing up disk space. Details: ${e.message}`);
            } else {
              throw e;
            }
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, engineConfig.retryDelayMs));
          
          // Reset progress for next attempt
          setLoadingProgress(0);
        }
      }

      if (!isCancelled) {
        // Set to 100% and show completion message
        setLoadingProgress(1);
        setLoadingText(DEV_MODE ? "Model loaded successfully!" : "Ready!");
        
        // Small delay to show the completion state
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Reset state and close modal
        setIsModelLoaded(true);
        setIsInitializing(false);
        setShowLoadingModal(false);
        setChatHistory([]);
        
        if (DEV_MODE) {
          console.log("Engine loaded successfully");
        }
      }
    } catch (e) {
      if (!isCancelled) {
        console.error("Failed to load engine:", e);
        setError(`Failed to load the model: ${e.message}`);
        setIsInitializing(false);
        setIsModelLoaded(false);
      }
    }
  }

  // Helper function to get GPU tier information
  async function getGPUTier() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return 'WebGL not supported';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'GPU info not available';
    } catch (e) {
      return 'Could not detect GPU';
    }
  }

  const onStop = async () => {
    if (chatInstance) {
      setIsGenerating(false);
      await chatInstance.interruptGenerate();
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isGenerating) return;

    // Load the model if it's not loaded yet
    if (!isModelLoaded) {
      await loadEngine();
    }

    setIsGenerating(true);
    const newMessage: ChatMessage = { role: "user", content: userInput };
    setChatHistory((prev) => [...prev, newMessage]);
    setUserInput("");

    try {
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setChatHistory((prev) => [...prev, assistantMessage]);

      if (!chatInstance) {
        throw new Error("Chat instance not initialized");
      }

      // Use the OpenAI-style chat completion API
      const stream = await chatInstance.chat.completions.create({
        messages: [...chatHistory, newMessage],
        stream: true,
        temperature: chatOpts.temperature,
        max_tokens: chatOpts.max_gen_len,
        presence_penalty: chatOpts.presence_penalty,
        frequency_penalty: chatOpts.frequency_penalty,
        top_p: chatOpts.top_p,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullResponse;
          return updated;
        });
      }
    } catch (e) {
      console.error("Error generating response:", e);
      setError("Failed to generate response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset model loaded state when model changes
  useEffect(() => {
    if (chatInstance) {
      setIsModelLoaded(false);
    }
  }, [selectedModel]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="flex flex-1 flex-col">
          <MessageList messages={chatHistory} />
          <div className="container mx-auto max-w-4xl px-4">
            <div className="py-4">
              <div className="flex items-center gap-3">
                <div className="flex-none">
                  <ModelsDropdown />
                </div>
                <div className="flex-1">
                  <UserInput onSubmit={onSubmit} onStop={onStop} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Progress Modal */}
      <AnimatePresence>
        {showLoadingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative animate-fade-in">
              <button 
                onClick={() => setShowLoadingModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                title="Dismiss dialog"
              >
                ✕
              </button>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-6">Loading Model</h3>
                <div className="mb-6">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  {loadingText}
                  {!loadingText.includes('%') && loadingProgress > 0 && ` (${Math.round(loadingProgress * 100)}%)`}
                </p>
                <button
                  onClick={cancelLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
