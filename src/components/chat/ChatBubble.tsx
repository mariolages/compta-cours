import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  content: string;
  isCurrentUser: boolean;
  timestamp: Date;
  read?: boolean;
  senderName?: string;
  isTyping?: boolean;
}

export const ChatBubble = ({ content, isCurrentUser, timestamp, read, senderName, isTyping }: ChatBubbleProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3", isCurrentUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/10 text-primary">
          {(senderName || 'U')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[70%]", isCurrentUser ? "items-end" : "items-start")}>
        {!isCurrentUser && senderName && (
          <span className="text-xs text-gray-400 ml-2 mb-1">{senderName}</span>
        )}
        
        <div className="flex flex-col gap-1">
          <div 
            className={cn(
              "break-words rounded-2xl px-4 py-2 shadow-sm",
              isCurrentUser 
                ? "bg-blue-500 text-white rounded-br-md" 
                : "bg-[#2C2C2E] text-white rounded-bl-md",
              isTyping && "min-w-[60px]"
            )}
          >
            {isTyping ? (
              <motion.div 
                className="flex gap-1 justify-center items-center h-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full"
                    animate={{
                      y: ["0%", "-50%", "0%"],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            )}
          </div>
          
          <div className="text-xs text-gray-400 flex items-center gap-1 px-2">
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
      </div>
    </motion.div>
  );
};