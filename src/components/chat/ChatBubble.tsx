import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: Date;
}

export const ChatBubble = ({ content, isCurrentUser, timestamp }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 animate-slide-in transition-all",
          isCurrentUser
            ? "bg-[#61AAF2] text-white"
            : "bg-[#3A3935] text-gray-100"
        )}
      >
        <p className="break-words">{content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};