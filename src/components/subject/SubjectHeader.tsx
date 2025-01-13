import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SubjectHeaderProps {
  subject: {
    name: string;
    code: string;
  };
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

export const SubjectHeader = ({ subject, showSidebar, setShowSidebar }: SubjectHeaderProps) => {
  const isMobile = useMobile();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">
            {subject.code} - {subject.name}
          </h1>
        </div>
      </div>
    </header>
  );
};