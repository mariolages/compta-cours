import { MessageSquare, Info } from "lucide-react";

interface ChatHeaderProps {
  name: string;
}

export const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
        <MessageSquare className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white">{name}</h3>
        <p className="text-sm text-gray-400">En ligne</p>
      </div>
      <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
        <Info className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  );
};