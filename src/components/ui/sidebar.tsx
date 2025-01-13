import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function Sidebar({
  className,
  children,
  defaultCollapsed = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const isMobile = useMobile();

  if (isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-white/80 backdrop-blur-sm",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 z-20 h-8 w-8 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <ScrollArea className="flex-1">
        {children}
      </ScrollArea>
    </div>
  );
}