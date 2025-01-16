import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatHeaderProps {
  name: string;
}

export const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#1C1C1E] border-b border-gray-800">
      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600">
        <AvatarFallback className="text-white font-medium">
          {name[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-white">{name}</h2>
        <p className="text-sm text-gray-400">En ligne</p>
      </div>
    </div>
  );
};