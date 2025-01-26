'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore, type Message } from '../lib/store';
import { chatService } from '../lib/chat-service';

export function ChatInterface() {
  const {
    conversations,
    activeConversationId,
    addMessage,
    updateMessage,
    modelPreference,
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  useEffect(() => {
    // Initialize chat service based on preference
    chatService.initialize(modelPreference === 'local', setProgress);

    return () => {
      chatService.cleanup();
    };
  }, [modelPreference]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    addMessage(activeConversationId, userMessage);
    setInput('');
    setIsProcessing(true);
    setProgress(0);

    try {
      // Get conversation context
      const context = activeConversation?.messages
        .slice(-5)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const response = await chatService.processMessage(
        userMessage,
        context,
        setProgress
      );
      addMessage(activeConversationId, response);
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage(activeConversationId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (!activeConversation) {
    return <div>No active conversation</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {activeConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
            {message.model && (
              <div className="text-xs text-gray-500 mt-1">
                via {message.model}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex flex-col gap-2">
          {isProcessing && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              ></div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
