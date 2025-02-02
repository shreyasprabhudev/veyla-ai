import * as webllm from "@mlc-ai/web-llm";
import { FaUser, FaRobot } from "react-icons/fa6";
import Markdown from "react-markdown";
import { useChatStore } from "../hooks/useChatStore";
import { MODEL_DESCRIPTIONS } from "../models";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function Message({ message }: { message: webllm.ChatCompletionMessageParam }) {
  const selectedModel = useChatStore((state) => state.selectedModel);

  return (
    <div className="p-4 rounded-lg mt-2 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-x-2">
        <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          {message.role === "assistant" ? (
            <FaRobot className="w-4 h-4 text-purple-400" />
          ) : (
            <FaUser className="w-4 h-4 text-pink-400" />
          )}
        </div>
        <div className="font-semibold text-gray-200">
          {message.role === "assistant"
            ? MODEL_DESCRIPTIONS[selectedModel].displayName
            : "You"}
        </div>
      </div>
      <Markdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg border border-purple-500/20 bg-black/50 backdrop-blur-sm my-4"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
        className="text-gray-300 pl-12 mt-2 leading-relaxed prose prose-invert
          prose-headings:text-gray-200
          prose-p:text-gray-300
          prose-a:text-purple-400 hover:prose-a:text-purple-300
          prose-strong:text-gray-200
          prose-code:text-pink-400
          prose-pre:bg-transparent
          max-w-none"
      >
        {typeof message.content === "string"
          ? message.content
          : "Non-string content found"}
      </Markdown>
    </div>
  );
}
