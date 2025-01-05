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
      <div 
        className={cn(
          "max-w-[70%] break-words rounded-2xl px-4 py-2",
          isCurrentUser 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-[#2C2C2E] text-white rounded-bl-md"
        )}
      >
        <p className="text-sm">{content}</p>
      </div>
      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
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