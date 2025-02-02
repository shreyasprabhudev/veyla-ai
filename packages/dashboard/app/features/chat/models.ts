export enum Model {
  MISTRAL_7B_INSTRUCT_V0_2 = "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
  LLAMA_2_7B_CHAT = "Llama-2-7b-chat-hf-q4f32_1-MLC",
  TINYLAMA_1_1B_CHAT = "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC",
  PHI_2 = "phi-2-q4f32_1-MLC",
}

export const MODEL_DESCRIPTIONS: {
  [key in Model]: { displayName: string; icon: string };
} = {
  [Model.LLAMA_2_7B_CHAT]: {
    displayName: "Llama 2 (7B)",
    icon: "🦙",
  },
  [Model.MISTRAL_7B_INSTRUCT_V0_2]: {
    displayName: "Mistral 7B",
    icon: "🌬️",
  },
  [Model.TINYLAMA_1_1B_CHAT]: {
    displayName: "TinyLlama",
    icon: "🦙",
  },
  [Model.PHI_2]: {
    displayName: "Phi-2",
    icon: "🦙",
  },
};
