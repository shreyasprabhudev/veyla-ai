'use client';

import * as webllm from "@mlc-ai/web-llm";
import { create } from "zustand";
import { Model } from "./models";

type ChatMessage = webllm.ChatCompletionMessageParam;

interface ChatStore {
  userInput: string;
  setUserInput: (input: string) => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  userInput: "",
  setUserInput: (input) => set({ userInput: input }),
  chatHistory: [],
  setChatHistory: (history) =>
    set((state) => ({
      chatHistory: typeof history === "function" ? history(state.chatHistory) : history,
    })),
  selectedModel: Model.TINYLAMA_1_1B_CHAT, // Start with TinyLlama as it's smaller
  setSelectedModel: (model) => set({ selectedModel: model }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

export type { ChatMessage };
export default useChatStore;
