'use client';

import { useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ModelSelector } from './components/ModelSelector';
import { useChatStore } from './lib/store';

export default function Home() {
  const { addConversation, activeConversationId } = useChatStore();

  useEffect(() => {
    // Create a new conversation if none exists
    if (!activeConversationId) {
      addConversation({
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: [],
        model: 'gpt-3.5-turbo',
        created: Date.now(),
        updated: Date.now(),
      });
    }
  }, [activeConversationId, addConversation]);

  return (
    <main className="flex min-h-screen flex-col">
      <ModelSelector />
      <div className="flex-1">
        <ChatInterface />
      </div>
    </main>
  );
}
