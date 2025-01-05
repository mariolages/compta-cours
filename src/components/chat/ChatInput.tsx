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
    <form onSubmit={handleSubmit} className="chat-input-container">
      <div className="flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="chat-input"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !message.trim()}
          className="chat-send-button"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};