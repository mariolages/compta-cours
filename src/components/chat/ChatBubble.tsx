import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: Date;
  read?: boolean;
}

export const ChatBubble = ({ content, isCurrentUser, timestamp, read }: ChatBubbleProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}
    >
      <div 
        className={cn(
          "max-w-[70%] break-words rounded-2xl px-4 py-2 shadow-sm",
          isCurrentUser 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-[#2C2C2E] text-white rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
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
    </motion.div>
  );
};