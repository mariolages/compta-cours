interface ChatHeaderProps {
  name: string;
}

export const ChatHeader = ({ name }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-white font-semibold">{name}</h3>
    </div>
  );
};