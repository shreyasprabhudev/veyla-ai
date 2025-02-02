'use client';

import { FaArrowUp } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "../store";
import { MODEL_DESCRIPTIONS } from "../models";

interface UserInputProps {
  onSubmit: () => Promise<void>;
  onStop: () => void;
}

export function UserInput({
  onSubmit,
  onStop,
}: UserInputProps) {
  const { userInput, setUserInput, selectedModel, isGenerating } = useChatStore();

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    await onSubmit();
  };

  return (
    <div className="p-4 py-2">
      <div className="flex items-center p-2 border rounded-xl shadow-sm">
        <Input
          className="flex-1 border-none shadow-none focus:ring-0 
              ring-0 focus:border-0 focus-visible:ring-0 text-base"
          placeholder={`Message ${MODEL_DESCRIPTIONS[selectedModel].displayName}`}
          onChange={(e) => setUserInput(e.target.value)}
          value={userInput}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSubmit();
            }
          }}
        />
        {!isGenerating && (
          <Button className="p-2" variant="ghost" onClick={handleSubmit}>
            <FaArrowUp className="h-5 w-5 text-gray-500" />
          </Button>
        )}
        {isGenerating && (
          <Button className="p-2" variant="ghost" onClick={onStop}>
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
