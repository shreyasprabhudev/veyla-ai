"use client"

import { useEffect, useRef } from "react"
import { Message } from "./Message"
import { useChatStore } from "../store"
import { cn } from "@/lib/utils"

export function MessageList() {
  const chatHistory = useChatStore((state) => state.chatHistory)
  const isLoading = useChatStore((state) => state.isLoading)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  return (
    <div className={cn(
      "flex-1 overflow-y-auto px-4",
      "bg-gradient-to-b from-background to-background/80",
      "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/40 hover:scrollbar-thumb-border/60"
    )}>
      <div className="container mx-auto max-w-4xl py-4">
        {(!chatHistory || chatHistory.length === 0) && !isLoading && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-muted-foreground">
              Start a conversation by sending a message
            </div>
          </div>
        )}
        {chatHistory?.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        {isLoading && (
          <Message
            message={{
              role: "assistant",
              content: "Thinking...",
            }}
            isLoading={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
