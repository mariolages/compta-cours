import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 sticky bottom-0 bg-[#141413]">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écrivez votre message..."
        className="flex-1 bg-[#0000001f] border-none text-white placeholder:text-gray-400"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !message.trim()}
        className="bg-[#61AAF2] hover:bg-[#3A3935] transition-colors shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};