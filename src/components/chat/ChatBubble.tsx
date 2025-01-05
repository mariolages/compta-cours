import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: Date;
  read?: boolean;
}

export const ChatBubble = ({ content, isCurrentUser, timestamp, read }: ChatBubbleProps) => {
  return (
    <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
      <div className={isCurrentUser ? "chat-bubble-sent" : "chat-bubble-received"}>
        <p>{content}</p>
      </div>
      <div className="chat-timestamp flex items-center gap-1">
        {new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
        {isCurrentUser && (
          <span className="ml-1">
            {read ? (
              <CheckCheck className="h-3 w-3 text-blue-400" />
            ) : (
              <Check className="h-3 w-3 text-gray-400" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};