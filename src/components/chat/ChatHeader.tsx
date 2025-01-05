import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from "lucide-react";

interface ChatHeaderProps {
  name: string;
}

export const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <Avatar className="h-10 w-10">
        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
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