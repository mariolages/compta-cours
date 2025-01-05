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
    <div
      className={cn(
        "flex w-full mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 animate-slide-in transition-all relative",
          isCurrentUser
            ? "bg-[#61AAF2] text-white"
            : "bg-[#3A3935] text-gray-100"
        )}
      >
        <p className="break-words">{content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isCurrentUser && (
            <span className="text-xs">
              {read ? (
                <CheckCheck className="h-3 w-3 text-white" />
              ) : (
                <Check className="h-3 w-3 text-white" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};