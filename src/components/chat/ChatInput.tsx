import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.form 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="p-4 bg-[#1C1C1E] border-t border-gray-800"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Joindre un fichier</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="bg-[#2C2C2E] border-none text-white placeholder-gray-400 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500/50 pr-10"
          />
          <AnimatePresence>
            {message.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-blue-500 hover:text-blue-400"
                  disabled={isLoading || !message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ajouter un emoji</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "text-gray-400 hover:text-gray-300 hover:bg-gray-800",
                  isRecording && "text-red-500 hover:text-red-400"
                )}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Message vocal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.form>
  );
};