import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <motion.form 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="p-4 bg-[#1C1C1E] border-t border-gray-800"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-300"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="bg-[#2C2C2E] border-none text-white placeholder-gray-400 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500/50"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-gray-300"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !message.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </motion.form>
  );
};