"use client"

import { cn } from "@/lib/utils"
import { Message as MessageType } from "@/app/features/chat/types"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FaUser, FaRobot } from "react-icons/fa6"
import Markdown from "react-markdown"

interface MessageProps {
  message: MessageType
  isLoading?: boolean
}

export function Message({ message, isLoading }: MessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "group relative mb-4 flex items-start md:mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("flex items-center gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        <Avatar className={cn(
          "h-8 w-8",
          isUser ? "bg-primary/10" : "bg-muted"
        )}>
          <AvatarFallback className={cn(
            isUser ? "text-primary" : "text-foreground"
          )}>
            {isUser ? <FaUser size={14} /> : <FaRobot size={14} />}
          </AvatarFallback>
        </Avatar>
        <Card className={cn(
          "max-w-2xl px-4 py-3",
          "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isUser ? "bg-primary/5 dark:bg-primary/10" : "bg-muted/50",
          isLoading && "animate-pulse"
        )}>
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            "text-foreground/90",
            "marker:text-foreground selection:bg-primary/30"
          )}>
            <Markdown>
              {typeof message.content === "string"
                ? message.content
                : "Non-string content found"}
            </Markdown>
          </div>
        </Card>
      </div>
    </div>
  )
}
