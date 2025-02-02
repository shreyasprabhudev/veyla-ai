'use client';

import * as webllm from "@mlc-ai/web-llm";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "../store";
import { MODEL_DESCRIPTIONS, Model } from "../models";
import { engineConfig } from "../config";

interface ModelsDropdownProps {
  resetEngineAndChatHistory: () => void;
}

export function ModelsDropdown({ resetEngineAndChatHistory }: ModelsDropdownProps) {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [modelsState, setModelsState] = useState<{ [key: string]: boolean }>({});

  const IS_MODEL_STATUS_CHECK_ENABLED = false;

  async function updateModelStatus() {
    console.log("Checking model status");
    Object.values(Model).forEach(async (model) => {
      const isInCache = await webllm.hasModelInCache(model, engineConfig);
      console.log(`${model} in cache: ${isInCache}`);
      setModelsState((prev) => ({
        ...prev,
        [model]: isInCache,
      }));
    });
  }

  useEffect(() => {
    if (IS_MODEL_STATUS_CHECK_ENABLED) {
      updateModelStatus();
    }
  }, []);

  const handleModelChange = (value: string) => {
    setSelectedModel(value as Model);
  };

  return (
    <Select 
      onValueChange={handleModelChange} 
      value={selectedModel} 
      className="h-10 w-[180px] rounded-lg border-input bg-background hover:bg-accent hover:text-accent-foreground"
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="w-[180px]">
        <SelectGroup>
          {Object.entries(MODEL_DESCRIPTIONS).map(([model, { displayName, icon }]) => (
            <SelectItem key={model} value={model} className="flex items-center justify-between px-2 py-1.5 cursor-pointer">
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span>{displayName}</span>
                {IS_MODEL_STATUS_CHECK_ENABLED && modelsState[model] && (
                  <span className="text-xs text-green-500">(cached)</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
